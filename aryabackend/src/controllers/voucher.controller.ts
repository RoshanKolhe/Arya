import {inject} from '@loopback/core';
import {TallyHttpCallService} from '../services/tally-http-call';
import {VoucherRepository} from '../repositories';
import {
  DefaultTransactionalRepository,
  IsolationLevel,
  repository,
} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {HttpErrors, post} from '@loopback/rest';
import {Voucher} from '../models';
import {ALL_VOUCHERS_DATA} from '../helpers/getAllVouchers';
import {ACTIVE_COMPANY_TALLY_XML} from '../helpers/getActiveCompanyTallyXml';

export class VoucherController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(VoucherRepository)
    public voucherRepository: VoucherRepository,
    @inject('service.tally.service')
    public tallyPostService: TallyHttpCallService,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/vouchers/sync')
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

  
}
