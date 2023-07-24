/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/core';
import {TallyHttpCallService} from '../services/tally-http-call';
import {UserProfile} from '@loopback/security';
import {
  LedgerRepository,
  ProductRepository,
  VoucherProductRepository,
  VoucherRepository,
} from '../repositories';
import {
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {HttpErrors, post, get, requestBody, param} from '@loopback/rest';
import {Voucher} from '../models';
import {ALL_VOUCHERS_DATA} from '../helpers/getAllVouchers';
import {ACTIVE_COMPANY_TALLY_XML} from '../helpers/getActiveCompanyTallyXml';
import {SYNC_VOUCHERS_DATA_XML} from '../helpers/syncVoucehrWithTallyXml';

export class VoucherController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(LedgerRepository)
    public ledgerRepository: LedgerRepository,
    @repository(VoucherRepository)
    public voucherRepository: VoucherRepository,
    @inject('service.tally.service')
    public tallyPostService: TallyHttpCallService,
    @repository(VoucherProductRepository)
    public voucherProductRepository: VoucherProductRepository,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/vouchers/syncFromTally')
  async syncVouchers(): Promise<any> {
    try {
      const companyXml = ACTIVE_COMPANY_TALLY_XML();
      const result: any = await this.tallyPostService.postTallyXML(companyXml);
      const parsedCompanyXmlData =
        await this.tallyPostService.parseActiveCompany(result);
      const inputData = {
        fromDate: parsedCompanyXmlData.startingFrom,
        toDate: '20240331',
      };
      const tallyXml = ALL_VOUCHERS_DATA(inputData);

      const res: any = await this.tallyPostService.postTallyXML(tallyXml);
      console.log('res', res);

      const parsedXmlData = await this.tallyPostService.parseVoucherToObjects(
        res,
      );
      console.log('parsedXmlData', parsedXmlData);

      const repo = new DefaultTransactionalRepository(Voucher, this.dataSource);
      const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

      try {
        await this.voucherRepository.deleteAll(undefined, {
          transaction: tx,
        });

        const finalMappedObject: Voucher[] = parsedXmlData.map(
          (voucher: any) => {
            const mappedVoucher: Voucher = new Voucher();
            mappedVoucher.guid = voucher.GUID;
            mappedVoucher.alterid = voucher.ALTERID;
            mappedVoucher.date = voucher.DATE;
            mappedVoucher.voucher_type = voucher.VOUCHER_TYPE;
            mappedVoucher._voucher_type = voucher._VOUCHER_TYPE;
            mappedVoucher.voucher_number = voucher.VOUCHER_NUMBER;
            mappedVoucher.reference_number = voucher.REFERENCE_NUMBER;
            mappedVoucher.reference_date = voucher.REFERENCE_DATE;
            mappedVoucher.narration = voucher.NARRATION;
            mappedVoucher.party_name = voucher.PARTY_NAME;
            mappedVoucher._party_name = voucher._PARTY_NAME;
            mappedVoucher.place_of_supply = voucher.PLACE_OF_SUPPLY;
            mappedVoucher.is_invoice = voucher.IS_INVOICE;
            mappedVoucher.is_accounting_voucher = voucher.IS_ACCOUNTING_VOUCHER;
            mappedVoucher.is_inventory_voucher = voucher.IS_INVENTORY_VOUCHER;
            mappedVoucher.is_order_voucher = voucher.IS_ORDER_VOUCHER;

            return mappedVoucher;
          },
        );

        await this.voucherRepository.createAll(finalMappedObject, {
          transaction: tx,
        });

        await tx.commit();

        // Return success response
        return {
          success: true,
          message: 'Sync successful',
        };
      } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new Error(
          'Error synchronizing products. Transaction rolled back.',
        );
      }
    } catch (error) {
      console.log(error);
      throw new HttpErrors.PreconditionFailed(error.message);
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/vouchers/syncToTally')
  async syncVouchersToTally(
    @requestBody({})
    voucher: any,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Voucher, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      await this.voucherRepository.updateById(
        voucher.id,
        {
          is_synced: 1,
        },
        {
          transaction: tx,
        },
      );
      const voucherPostXml = SYNC_VOUCHERS_DATA_XML(voucher);
      console.log(voucherPostXml);
      const result: any = await this.tallyPostService.postTallyXML(
        voucherPostXml,
      );
      console.log(result);

      const parsedCompanyXmlData =
        await this.tallyPostService.parseSuccessSyncVoucherData(result);
      console.log(parsedCompanyXmlData);

      if (parsedCompanyXmlData.HEADER.STATUS[0] === '1') {
        await tx.commit();
      } else {
        await tx.rollback();
      }
      return parsedCompanyXmlData;
    } catch (error) {
      await tx.rollback();
      console.log(error);
      throw new HttpErrors.PreconditionFailed(error.message);
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/voucher/create')
  async create(
    @requestBody({})
    voucher: any,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Voucher, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      // Check if the voucher object is valid
      if (!voucher || typeof voucher !== 'object') {
        throw new Error('Invalid voucher data');
      }

      // Check if the required properties exist in the voucher object
      const requiredProperties = ['partyGuid'];
      for (const property of requiredProperties) {
        if (!(property in voucher)) {
          throw new Error(`Missing required property: ${property}`);
        }
      }

      // Fetch the party data from the ledger repository
      const party = await this.ledgerRepository.findOne({
        where: {
          guid: voucher.partyGuid,
        },
      });

      // Check if the party exists
      if (!party) {
        throw new Error('Party not found');
      }

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const voucherCreateData = {
        date: formattedDate,
        voucher_type: 'Sales',
        _voucher_type: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000026',
        party_name: party.name,
        _party_name: party.guid,
        place_of_supply: 'Goa',
        is_invoice: true,
        is_accounting_voucher: true,
        is_inventory_voucher: false,
        is_order_voucher: false,
        is_synced: 0,
        totalAmount: voucher.totalPrice,
        totalQuantity: voucher.totalQuantity,
      };

      const newVoucher = await this.voucherRepository.create(
        voucherCreateData,
        {
          transaction: tx,
        },
      );

      const voucherProducts = voucher.products.map((product: any) => {
        return {
          voucherId: newVoucher.id,
          productId: product.productGuid,
          quantity: product.quantity,
          rate: product.rate,
          amount: parseInt(product.quantity) * parseFloat(product.rate),
          discount: product.discount,
          godown: 'Main Location',
          _godown: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000003a',
          notes: product.notes,
        };
      });
      await this.voucherProductRepository.createAll(voucherProducts, {
        transaction: tx,
      });
      await tx.commit();
      return newVoucher;
    } catch (error) {
      await tx.rollback();

      // Handle errors and return appropriate response
      console.error('Error creating voucher:', error);
      throw new Error('Failed to create voucher');
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/voucher/update')
  async updateVoucher(@requestBody({}) voucherData: any): Promise<any> {
    const repo = new DefaultTransactionalRepository(Voucher, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const voucher = await this.voucherRepository.findById(
        parseInt(voucherData.voucherNumber),
      );

      if (!voucher) {
        throw new HttpErrors.NotFound('Voucher not found');
      }

      const party = await this.ledgerRepository.findOne({
        where: {
          guid: voucherData.party_name,
        },
      });

      if (!party) {
        throw new HttpErrors.UnprocessableEntity('Party not found');
      }

      let totalAmountData = 0;
      let totalQuantityData = 0;

      for (const item of voucherData.items) {
        totalQuantityData += item.quantity;
        totalAmountData += item.quantity * item.rate;
      }

      const voucherUpdateData = {
        date: voucherData.date,
        voucher_type: 'Sales',
        _voucher_type: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000026',
        party_name: party.name,
        _party_name: party.guid,
        place_of_supply: 'Goa',
        is_invoice: true,
        is_accounting_voucher: true,
        is_inventory_voucher: false,
        is_order_voucher: false,
        is_synced: 0,
        totalAmount: totalAmountData,
        totalQuantity: totalQuantityData,
      };

      await this.voucherRepository.updateById(voucher.id, voucherUpdateData, {
        transaction: tx,
      });

      const voucherProducts: any[] = await Promise.all(
        voucherData.items.map(async (product: any) => {
          const productData = await this.productRepository.findOne({
            where: {name: product.productName},
          });
          console.log(product.productName);
          console.log(productData);
          return {
            voucherId: voucher.id,
            productId: productData?.guid,
            quantity: product.quantity,
            rate: product.rate,
            amount: product.rate * product.quantity, // Calculate the total amount for each product
            discount: product.discount || 0,
            godown: 'Main Location',
            _godown: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000003a',
            notes: product.notes,
          };
        }),
      );

      await this.voucherProductRepository.deleteAll(
        {
          voucherId: voucher.id,
        },
        {
          transaction: tx,
        },
      );
      await this.voucherProductRepository.createAll(voucherProducts, {
        transaction: tx,
      });

      await tx.commit();

      return await Promise.resolve({
        success: true,
        message: 'Voucher products synced successfully',
      });
    } catch (error) {
      await tx.rollback();
      console.log('Error creating voucher:', error);
      throw new HttpErrors.InternalServerError('Failed to update voucher');
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/vouchers/list')
  async find(@param.filter(Voucher) filter?: Filter<Voucher>): Promise<any[]> {
    try {
      const vouchers = await this.voucherRepository.find({
        include: [
          {
            relation: 'user',
            scope: {
              fields: {
                password: false,
                otp: false,
                otpExpireAt: false,
              },
            },
          },
        ],
        ...filter,
      });

      const updatedVouchers = await Promise.all(
        vouchers.map(async voucher => {
          const voucherProducts = await this.voucherProductRepository.find({
            where: {
              voucherId: voucher.id,
            },
          });

          const updatedVoucherProducts = await Promise.all(
            voucherProducts.map(async voucherProduct => {
              const productData = await this.productRepository.findOne({
                where: {
                  guid: voucherProduct.productId,
                },
              });

              return {
                productName: productData?.name,
                productGuid: voucherProduct?.productId,
                quantity: voucherProduct?.quantity,
                rate: voucherProduct?.rate,
                amount: voucherProduct?.amount,
                discount: voucherProduct?.discount,
                godown: voucherProduct?.godown,
                _godown: voucherProduct?._godown,
                notes: voucherProduct?.notes,
              };
            }),
          );

          return {
            ...voucher,
            products: updatedVoucherProducts,
          };
        }),
      );

      return updatedVouchers;
    } catch (error) {
      console.error('Error retrieving vouchers:', error);
      throw new Error('Failed to retrieve vouchers');
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/vouchers/user/list')
  async getVoucherWithUser(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Voucher) filter?: Filter<Voucher>,
  ): Promise<any[]> {
    try {
      const vouchers = await this.voucherRepository.find({
        where: {
          userId: currnetUser.id,
        },
        ...filter,
      });

      const updatedVouchers = await Promise.all(
        vouchers.map(async voucher => {
          const voucherProducts = await this.voucherProductRepository.find({
            where: {
              voucherId: voucher.id,
            },
          });

          const updatedVoucherProducts = await Promise.all(
            voucherProducts.map(async voucherProduct => {
              const productData = await this.productRepository.findOne({
                where: {
                  guid: voucherProduct.productId,
                },
              });

              return {
                productName: productData?.name,
                productGuid: voucherProduct?.productId,
                quantity: voucherProduct?.quantity,
                rate: voucherProduct?.rate,
                amount: voucherProduct?.amount,
                discount: voucherProduct?.discount,
                godown: voucherProduct?.godown,
                _godown: voucherProduct?._godown,
                notes: voucherProduct?.notes,
              };
            }),
          );

          return {
            ...voucher,
            products: updatedVoucherProducts,
          };
        }),
      );

      return updatedVouchers;
    } catch (error) {
      console.error('Error retrieving vouchers:', error);
      throw new Error('Failed to retrieve vouchers');
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/vouchers/{id}')
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Voucher, {exclude: 'where'})
    filter?: FilterExcludingWhere<Voucher>,
  ): Promise<any> {
    try {
      const voucher = await this.voucherRepository.findById(id);

      const voucherProducts = await this.voucherProductRepository.find({
        where: {
          voucherId: voucher.id,
        },
      });

      const updatedVoucherProducts = await Promise.all(
        voucherProducts.map(async voucherProduct => {
          const productData = await this.productRepository.findOne({
            where: {
              guid: voucherProduct.productId,
            },
          });

          return {
            productName: productData?.name,
            productGuid: voucherProduct?.productId,
            quantity: voucherProduct?.quantity,
            rate: voucherProduct?.rate,
            amount: voucherProduct?.amount,
            discount: voucherProduct?.discount,
            godown: voucherProduct?.godown,
            _godown: voucherProduct?._godown,
            notes: voucherProduct?.notes,
          };
        }),
      );

      return {
        ...voucher,
        products: updatedVoucherProducts,
      };
    } catch (error) {
      console.error('Error retrieving vouchers:', error);
      throw new Error('Failed to retrieve vouchers');
    }
  }
}
