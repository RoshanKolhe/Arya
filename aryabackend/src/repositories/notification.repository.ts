import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Notification, NotificationRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class NotificationRepository extends TimeStampRepositoryMixin<
  Notification,
  typeof Notification.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Notification,
      typeof Notification.prototype.id,
      NotificationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.arya') dataSource: AryaDataSource) {
    super(Notification, dataSource);
  }
}
