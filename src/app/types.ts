export type Cat = {
    id: number;
    name:string;
    age:number;
    breed:string;
   
}


export type Query={
    getCats: [Cat]
}