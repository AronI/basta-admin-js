import { BastaRequest } from '../types/request';
import {
  IAccountService,
  IBastaAdmin,
  IBidService,
  IItemService,
  ISaleService,
  IWebHookService,
} from '../types/sdk';
import { AccountService } from './services/account-service';
import { BidService } from './services/bid-service';
import { ItemService } from './services/item-service';
import { SaleService } from './services/sale-service';
import { WebHookService } from './services/web-hook-service';

// Only export enums here. Types are exported in a .d.ts file elsewhere.
export {
  ActionHookStatus,
  ActionType,
  ApiKeyRole,
  BidType,
  ClosingMethod,
  ItemStatus,
  SaleStatus,
} from './gql/generated/types';

export const initBasta = (args: { accountId: string; secretKey: string }) => {
  // hello
  return new BastaAdmin(args.accountId, args.secretKey);
};

class BastaAdmin implements IBastaAdmin {
  readonly sale: ISaleService;
  readonly bid: IBidService;
  readonly item: IItemService;
  readonly account: IAccountService;
  readonly webhook: IWebHookService;

  private readonly _bastaReq: BastaRequest;

  constructor(accountId: string, secretKey: string) {
    if (typeof window !== 'undefined') {
      throw new Error(
        'Basta Admin SDK is not designed to be used in a browser environment. Exposing the secret key is a security risk.'
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASTA_ADMIN_SDK_GRAPHQL ||
      'management.api.basta.ai';

    this._bastaReq = {
      accountId: accountId,
      url: `https://${baseUrl}/graphql`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': secretKey,
        'x-account-id': accountId,
      },
    };

    this.sale = new SaleService(this._bastaReq);
    this.bid = new BidService(this._bastaReq);
    this.item = new ItemService(this._bastaReq);
    this.account = new AccountService(this._bastaReq);
    this.webhook = new WebHookService(this._bastaReq);
  }
}
