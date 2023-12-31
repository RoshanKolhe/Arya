/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
} from '@loopback/repository';
import {HttpErrors, get, param, post, requestBody} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {PermissionKeys} from '../authorization/permission-keys';
import {AryaDataSource} from '../datasources';
import {ACTIVE_COMPANY_TALLY_XML} from '../helpers/getActiveCompanyTallyXml';
import {ALL_VOUCHERS_DATA} from '../helpers/getAllVouchers';
import {SYNC_VOUCHERS_DATA_XML} from '../helpers/syncVoucehrWithTallyXml';
import {Voucher} from '../models';
import {
  LedgerRepository,
  ProductRepository,
  VoucherProductRepository,
  VoucherRepository,
} from '../repositories';
import {TallyHttpCallService} from '../services/tally-http-call';

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

      const result: any = await this.tallyPostService.postTallyXML(
        voucherPostXml,
      );

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
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
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
      let totalAmount = 0;
      let cgstAmount: any = 0;
      let sgstAmount: any = 0;
      let cessAmount: any = 0;
      let totalQuantity = 0;
      const voucherProducts = await Promise.all(
        voucher.products.map(async (product: any) => {
          const productDetails: any = await this.productRepository.findOne({
            where: {
              guid: product.guid,
            },
          });
          const totalTax =
            (Number(productDetails.cgst) +
              Number(productDetails.sgstOrUtgst) +
              Number(productDetails.cess)) /
            100;

          const totalRetailerMargin =
            Number(productDetails.retailerMargin) / 100;

          const productTotal =
            (Number(product.rate) * Number(product.quantity)) /
            (1 + totalRetailerMargin) /
            (1 + totalTax);

          const discountedTotal: any = (
            productTotal -
            productTotal * (product.discount / 100)
          ).toFixed(2);
          cgstAmount += (discountedTotal * Number(productDetails.cgst)) / 100;
          sgstAmount +=
            (discountedTotal * Number(productDetails.sgstOrUtgst)) / 100;
          cessAmount += (discountedTotal * Number(productDetails.cess)) / 100;
          totalAmount += Number(discountedTotal);
          totalQuantity += product.quantity;

          return {
            productId: product.productGuid,
            quantity: product.quantity,
            rate: product.rate,
            amount: discountedTotal,
            discount: product.discount,
            godown: 'Main Location',
            _godown: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000003a',
            notes: product.notes,
          };
        }),
      );
      const allTax: any = (cgstAmount + sgstAmount + cessAmount).toFixed(2);
      console.log('allTax', allTax);
      console.log(totalAmount);
      const totalValue = totalAmount + parseFloat(allTax);
      console.log('totalValue', totalValue);
      const roundedValue = Math.round(totalValue);
      console.log('roundedValue', roundedValue);
      const roundValue: any = totalValue - roundedValue;
      console.log(
        'roundValue',
        roundValue.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0],
      );

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
        totalAmount: roundedValue,
        cgst: cgstAmount.toFixed(2),
        sgst: sgstAmount.toFixed(2),
        cess: cessAmount.toFixed(2),
        roundOff: roundValue.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0],
        totalQuantity: totalQuantity,
        userId: currnetUser.id,
      };
      const newVoucher = await this.voucherRepository.create(
        voucherCreateData,
        {
          transaction: tx,
        },
      );

      const voucherProductsWithAmounts = voucherProducts.map((product: any) => {
        return {
          ...product,
          voucherId: newVoucher.id,
        };
      });
      await this.voucherProductRepository.createAll(
        voucherProductsWithAmounts,
        {
          transaction: tx,
        },
      );
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

      let totalAmount = 0;
      let cgstAmount: any = 0;
      let sgstAmount: any = 0;
      let cessAmount: any = 0;
      let totalQuantity = 0;
      const voucherProducts = await Promise.all(
        voucherData.items.map(async (product: any) => {
          const productDetails: any = await this.productRepository.findOne({
            where: {
              guid: product.productName.guid,
            },
          });
          const totalTax =
            (Number(productDetails.cgst) +
              Number(productDetails.sgstOrUtgst) +
              Number(productDetails.cess)) /
            100;

          const totalRetailerMargin =
            Number(productDetails.retailerMargin) / 100;

          const productTotal =
            (Number(product.rate) * Number(product.quantity)) /
            (1 + totalRetailerMargin) /
            (1 + totalTax);

          const discountedTotal: any = (
            productTotal -
            productTotal * (product.discount / 100)
          ).toFixed(2);
          cgstAmount += (discountedTotal * Number(productDetails.cgst)) / 100;
          sgstAmount +=
            (discountedTotal * Number(productDetails.sgstOrUtgst)) / 100;
          cessAmount += (discountedTotal * Number(productDetails.cess)) / 100;
          totalAmount += Number(discountedTotal);
          totalQuantity += product.quantity;

          return {
            voucherId: voucherData.voucherNumber,
            productId: product.productName.guid,
            quantity: product.quantity,
            rate: product.rate,
            amount: discountedTotal,
            discount: product.discount,
            godown: 'Main Location',
            _godown: 'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000003a',
            notes: product.notes,
          };
        }),
      );
      const allTax: any = (cgstAmount + sgstAmount + cessAmount).toFixed(2);
      const totalValue = totalAmount + parseFloat(allTax);

      const roundedValue = Math.round(totalValue);
      const roundValue: any = totalValue - roundedValue;
      console.log(roundValue);
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
        totalAmount: roundedValue,
        cgst: cgstAmount.toFixed(2),
        sgst: sgstAmount.toFixed(2),
        cess: cessAmount.toFixed(2),
        roundOff: roundValue.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0],
        totalQuantity: totalQuantity,
      };

      await this.voucherRepository.updateById(voucher.id, voucherUpdateData, {
        transaction: tx,
      });

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
        message: 'Voucher products updated successfully',
      });
    } catch (error) {
      await tx.rollback();
      console.log('Error updating voucher:', error);
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
          {
            relation: 'ledger',
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
                total: voucherProduct?.amount,
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
                total: voucherProduct?.amount,
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
      const voucher = await this.voucherRepository.findById(id, {
        include: ['ledger'],
      });

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
            productName: productData,
            productGuid: voucherProduct?.productId,
            quantity: voucherProduct?.quantity,
            rate: voucherProduct?.rate,
            total: voucherProduct?.amount,
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
