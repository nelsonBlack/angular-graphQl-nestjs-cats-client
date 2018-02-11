import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { AppComponent } from './app.component';
import { ListComponent, DialogOverviewExampleDialog } from './list/list.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';


@NgModule({
 
  declarations: [
    AppComponent,
    ListComponent,
    DialogOverviewExampleDialog
  ],
  
  imports: [
    BrowserModule,
    MatCardModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule


  ],
  providers: [],
  entryComponents: [ DialogOverviewExampleDialog],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(
    apollo:Apollo,
    httpLink:HttpLink
  ){
    
    //create http link 
       
       const http = httpLink.create({
        uri: 'http://localhost:3000/graphql'
      });

       // Create a WebSocket link:
       const ws = new WebSocketLink({
        uri: `ws://localhost:3001/subscriptions`,
        options: {
          reconnect: true
        }
      });

       // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      ws,
      http,
    );

      apollo.create({
        link,
        cache:new InMemoryCache()
        
      })

   
  }
}
