import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AuthController } from '../src/auth/auth.controller';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';

type ContractRoute = {
  method: string;
  route: string;
};

const REQUEST_METHODS: Partial<Record<RequestMethod, string>> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
};

describe('Route/action contract coverage (e2e)', () => {
  it('renders route checks from the markdown contract and matches controller metadata', () => {
    const contract = readFileSync(
      join(process.cwd(), 'docs', 'route-action-contract.md'),
      'utf8',
    );

    const contractRoutes = parseContractRoutes(contract);
    const implementedRoutes = collectControllerRoutes([
      AuthController,
      NightlifeDataController,
    ]);

    expect(contractRoutes).toEqual(
      expect.arrayContaining([
        { method: 'POST', route: '/partner/coupon-issues/:code/scan' },
        { method: 'POST', route: '/partner/coupon-issues/scan' },
        {
          method: 'POST',
          route: '/partner/coupon-issues/:id/confirm-check-in',
        },
        { method: 'GET', route: '/admin/coupon-issues' },
        { method: 'GET', route: '/operator/bills' },
        {
          method: 'GET',
          route: '/admin/sensitive-bills/:billId/approval-preview',
        },
        {
          method: 'PATCH',
          route: '/admin/sensitive-bills/:billId/review',
        },
        {
          method: 'PATCH',
          route: '/admin/sensitive-bills/:billId/confirm-negative-commission',
        },
        {
          method: 'PATCH',
          route: '/admin/sensitive-bills/:billId/void',
        },
      ]),
    );
    expect(implementedRoutes).toEqual(expect.arrayContaining(contractRoutes));
    expect(implementedRoutes).not.toContainEqual({
      method: 'PATCH',
      route: '/member/bookings/:bookingId',
    });
    expect(contractRoutes).not.toContainEqual({
      method: 'PATCH',
      route: '/operator/bills/:billId/review',
    });
    expect(implementedRoutes).not.toContainEqual({
      method: 'PATCH',
      route: '/operator/bills/:billId/review',
    });
    expect(contract).toContain('Route/action contract v1.1');
    expect(contract).toContain('role":"OPERATOR"');
    expect(contract).not.toContain('STAFF as OPERATOR');
  });
});

function parseContractRoutes(contract: string): ContractRoute[] {
  return contract
    .split(/\r?\n/)
    .map((line) =>
      line.match(/\|\s*[^|]+\|\s*`(GET|POST|PATCH|PUT|DELETE) ([^`]+)`/),
    )
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      method: match[1],
      route: match[2],
    }));
}

function collectControllerRoutes(
  controllers: Array<new (...args: never[]) => unknown>,
) {
  return controllers.flatMap((controller) => {
    const controllerPath = normalizePath(
      Reflect.getMetadata(PATH_METADATA, controller) ?? '',
    );
    const prototype = controller.prototype as Record<string, unknown>;

    return Object.getOwnPropertyNames(prototype)
      .filter((property) => property !== 'constructor')
      .flatMap((property) => {
        const handler = prototype[property];
        if (typeof handler !== 'function') {
          return [];
        }

        const method =
          REQUEST_METHODS[
            Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod
          ];
        const pathMetadata = Reflect.getMetadata(PATH_METADATA, handler);
        if (!method || pathMetadata === undefined) {
          return [];
        }

        return [pathMetadata].flat().map((path) => ({
          method,
          route: joinRoutePaths(controllerPath, path),
        }));
      });
  });
}

function joinRoutePaths(controllerPath: string, methodPath: string) {
  return normalizePath(
    [controllerPath, methodPath]
      .map((path) => path.replace(/^\/+|\/+$/g, ''))
      .filter(Boolean)
      .join('/'),
  );
}

function normalizePath(path: string) {
  const normalized = path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  return normalized ? `/${normalized}` : '';
}
