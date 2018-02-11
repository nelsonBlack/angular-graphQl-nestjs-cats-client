import { FormControl, FormGroup, Validators, NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import gql from 'graphql-tag';
import { Cat, Query } from '../types';
import { forEach } from 'async';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  animal: string;
  name: string;
  //catsObject: any;
  catsObject:any;
  cats=[];
  deleteCat:any;
  
  constructor(private apollo: Apollo,
    public dialog: MatDialog) {

      this.apollo.watchQuery<Query>({
        query: gql`
        {
          getCats{
            id
            name
            breed
            age
            
          }
        }
  
        `
      }).valueChanges
        .subscribe(({ data }) => {
          this.cats=[];
  
          Object.keys(data.getCats).map((key)=> {
            this.cats.push(data.getCats[key])
          });
          
         
      },(error) => {
        console.log('there was an error sending the query', error);
      });

 
  }

  ngOnInit() {
  

    
//subscribe to catcreated event
  this.apollo.subscribe({
    query: gql`
    
      subscription {
        catCreated{
          breed
          age
          name
          id
        }
      }
    `
  }).subscribe((data=>{
    console.log(data)
    console.log(this.cats)
    if(data){
    
    this.cats.push(data.data.catCreated);
  }
    
  }), (error) => {
    console.log('there was an error sending the query', error);
  });   

  ////subscribe to catDeleted event
  this.apollo.subscribe({
    query: gql`
    
      subscription {
        catDeleted{
          breed
          age
          name
          id
        }
      }
    `
  }).subscribe((data=>{
    console.log(data)
    console.log(this.cats)
    if(data){
      this.removeCat(data.data.catDeleted.id);
    
    
  }
    
  }),
  (error) => {
    console.log('there was an error sending the query', error);
  });   

  ////subscribe to catEdited event
  this.apollo.subscribe({
    query: gql`
    
      subscription {
        catUpdated{
          breed
          age
          name
          id
        }
      }
    `
  }).subscribe((data=>{
    console.log(data)
    console.log(this.cats)
    if(data){
      this.editedCat(data.data.catUpdated);
    
    
  }
    
  }),
  (error) => {
    console.log('there was an error sending the query', error);
  });   

  }

  //called from subscribe to remove a cat 
  removeCat(id:any){
     //find index of cat object that as deleted 
     var removeIndex = this.cats.map(function(item) { return item.id; }).indexOf(id);
     this.cats.splice(removeIndex, 1);
     console.log(this.cats);
    
  }

  editedCat(editedCat:any){
    console.log(this.cats,'heres');
    //find index of cat object that as deleted 
  /*   var removeIndex = this.cats.map(function(item) { return item.id; }).indexOf(editedCat.id);
   this.cats= this.cats.splice(removeIndex, 1);

   console.log(this.cats);
    this.cats.push(editedCat);
    console.log(this.cats); */
   
 }

  deleteCats(id){
    let catId =id;
    this.deleteCat = gql`
    mutation deleteCat($id: ID!) {
      deleteCat(id: $id) {
        name
        age
        breed
        id
      }
    }`;
    this.apollo.mutate({
      mutation: this.deleteCat,
      variables: {
        id: catId
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });

  }
  

  openDialog(cat?:any): void {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { catData: cat }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  createCat(){
    this.openDialog();

  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {
  public basicForm: FormGroup;
  
   submitCat = gql`
  mutation createCat($name: String!,$age: Int!, $breed: String!) {
    createCat(name: $name,age:$age,breed:$breed) {
      name
      age
      breed
      id
    }
  }
`;

updateCat = gql`
mutation updateCat($id: ID!,$name: String!,$age: Int!, $breed: String!) {
  updateCat(id: $id, name: $name,age:$age,breed:$breed) {
    name
    age
    breed
    id
  }
}
`;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apollo: Apollo) {
      
      this.basicForm = new FormGroup({

        name: new FormControl(),
        age: new FormControl(),
        breed: new FormControl(),
        id: new FormControl()
  
      });
      if(data.catData!=undefined){
        this.basicForm.patchValue(data.catData);   
      }
     

     }

   
    
    public onSubmitCatForm(form: FormGroup): void {
//if id is not nul then this is an edit 
      if (form.value.id !=null){
        this.apollo.mutate({
          mutation: this.updateCat,
          variables: {
            id: form.value.id,
            name: form.value.name,
            age: form.value.age,
            breed:form.value.breed
          }
        }).subscribe(({ data }) => {
          console.log('got data', data);
          
          
        },(error) => {
          console.log('there was an error sending the query', error);
        });

      }else{
      this.apollo.mutate({
        mutation: this.submitCat,
        variables: {
          name: form.value.name,
          age: form.value.age,
          breed:form.value.breed
        }
      }).subscribe(({ data }) => {
        console.log('got data', data);
        
        
      },(error) => {
        console.log('there was an error sending the query', error);
      });
    }

    }


    
  onNoClick(): void {
    this.dialogRef.close();
  }

}
