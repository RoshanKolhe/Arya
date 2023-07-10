/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-useless-catch */
import { AuthenticationBindings } from '@loopback/authentication';
import {
  Getter,
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import { intersection } from 'lodash';
import { CurrentUser } from '../types';

@globalInterceptor('', { tags: { name: 'authorize' } })
export class AuthorizeInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    public metaData: any,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<CurrentUser>,
  ) { }

  value() {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      if (this.metaData) {
        if (!this.metaData[0]?.options?.required) return await next();
      }
      if (!this.metaData) return await next();

      const requiredPermissions = this.metaData[0]?.options?.required;
      const currentUserData = await this.getCurrentUser();

      if (currentUserData.permissions.includes('admin')) {
        // User has admin permission, allow access
        return await next();
      }

      const results = intersection(
        currentUserData.permissions,
        requiredPermissions,
      );

      if (results.length === 0) {
        throw new HttpErrors.Forbidden('INVALID ACCESS');
      }

      return await next();
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
