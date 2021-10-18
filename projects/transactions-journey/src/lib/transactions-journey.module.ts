import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { provideRoutes, Route, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TRANSLATIONS } from './constants/dynamic-translations';
import { TransactionsViewComponent } from './views/transactions-view/transactions-view.component';
import { InputTextModule } from '@backbase/ui-ang/input-text';
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component';
import { TextFilterComponent } from './components/text-filter/text-filter.component';
import { FilterTransactionsPipe } from './pipes/filter-transactions.pipe';
import { TransactionsHttpService } from './services/transactions.http.service';
import { TransactionsJourneyConfiguration } from './services/transactions-journey-config.service';
import { AmountModule } from '@backbase/ui-ang/amount';

const defaultRoute: Route = {
  path: '',
  component: TransactionsViewComponent,
  data: {
    title: TRANSLATIONS.transactionsTitle,
  },
};

@NgModule({
  declarations: [TransactionsViewComponent, TransactionItemComponent, TextFilterComponent, FilterTransactionsPipe],
  imports: [CommonModule, RouterModule, FormsModule, AmountModule, InputTextModule],
  providers: [TransactionsHttpService, TransactionsJourneyConfiguration],
})
export class TransactionsJourneyModule {
  static forRoot(
    data: { [key: string]: unknown; route: Route } = { route: defaultRoute },
  ): ModuleWithProviders<TransactionsJourneyModule> {
    return {
      ngModule: TransactionsJourneyModule,
      providers: [provideRoutes([data.route])],
    };
  }
}
