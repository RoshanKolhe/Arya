import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Ledger} from '../models';
import {LedgerRepository} from '../repositories';
import {FETCH_LEDGER_ACCOUNTS_XML} from '../helpers/getSalesLedgerAccounts';
import {TallyHttpCallService} from '../services/tally-http-call';
import {inject} from '@loopback/core';
import {AryaDataSource} from '../datasources';

export class LedgerController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(LedgerRepository)
    public ledgerRepository: LedgerRepository,
    @inject('service.tally.service')
    public tallyPostService: TallyHttpCallService,
  ) {}

  @post('/api/ledgers')
  @response(200, {
    description: 'Ledger model instance',
    content: {'application/json': {schema: getModelSchemaRef(Ledger)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ledger, {
            title: 'NewLedger',
            exclude: ['id'],
          }),
        },
      },
    })
    ledger: Omit<Ledger, 'id'>,
  ): Promise<Ledger> {
    return this.ledgerRepository.create(ledger);
  }

  @get('/api/ledgers/count')
  @response(200, {
    description: 'Ledger model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Ledger) where?: Where<Ledger>): Promise<Count> {
    return this.ledgerRepository.count(where);
  }

  @get('/api/ledgers/list')
  @response(200, {
    description: 'Array of Ledger model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Ledger, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Ledger) filter?: Filter<Ledger>): Promise<Ledger[]> {
    return this.ledgerRepository.find(filter);
  }

  @post('/api/ledgers/sync')
  async syncLedgers(): Promise<any> {
    try {
      const tallyXml = FETCH_LEDGER_ACCOUNTS_XML();
      const res: any = await this.tallyPostService.postTallyXML(tallyXml);
      const parsedXmlData = await this.tallyPostService.parseLedgerData(res);
      const repo = new DefaultTransactionalRepository(Ledger, this.dataSource);
      const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

      try {
        await this.ledgerRepository.deleteAll(undefined, {
          transaction: tx,
        });

        const finalMappedObject: Ledger[] = parsedXmlData.map((ledger: any) => {
          const mappedLedger: Ledger = new Ledger();
          mappedLedger.guid = ledger.guid;
          mappedLedger.name = ledger.name;
          mappedLedger.opening_balance = ledger.openingBalance || 0;
          return mappedLedger;
        });

        await this.ledgerRepository.createAll(finalMappedObject, {
          transaction: tx,
        });

        await tx.commit();

        // Return success response
        return {
          success: true,
          message: 'Sync successful',
        };
      } catch (err) {
        await tx.rollback();
        throw new Error(
          'Error synchronizing ledgers. Transaction rolled back.',
        );
      }
      return {parsedXmlData: parsedXmlData, length: parsedXmlData.length};
    } catch (error) {
      console.log(error);
      throw new Error('Error synchronizing ledgers.');
    }
  }

  @patch('/api/ledgers')
  @response(200, {
    description: 'Ledger PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ledger, {partial: true}),
        },
      },
    })
    ledger: Ledger,
    @param.where(Ledger) where?: Where<Ledger>,
  ): Promise<Count> {
    return this.ledgerRepository.updateAll(ledger, where);
  }

  @get('/api/ledgers/{id}')
  @response(200, {
    description: 'Ledger model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Ledger, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Ledger, {exclude: 'where'})
    filter?: FilterExcludingWhere<Ledger>,
  ): Promise<Ledger> {
    return this.ledgerRepository.findById(id, filter);
  }

  @patch('/api/ledgers/{id}')
  @response(204, {
    description: 'Ledger PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ledger, {partial: true}),
        },
      },
    })
    ledger: Ledger,
  ): Promise<void> {
    await this.ledgerRepository.updateById(id, ledger);
  }

  @put('/api/ledgers/{id}')
  @response(204, {
    description: 'Ledger PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() ledger: Ledger,
  ): Promise<void> {
    await this.ledgerRepository.replaceById(id, ledger);
  }

  @del('/api/ledgers/{id}')
  @response(204, {
    description: 'Ledger DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.ledgerRepository.deleteById(id);
  }
}
