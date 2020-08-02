import { Component } from '@angular/core';
import { EbayService } from "./ebay.service";

export interface SortBy {
  value: string;
  text: string;
}

export interface SortBy {
  value: string;
  text: string;
}

export interface Item {
  id : number;
  showDetails: boolean;
  title: string;
  price: string;
  from: string;
  category: string;
  condition: string;
  image: string;
  url : string,
  shippingType: string;
  shippingCost: string;
  shipToLocations: string;
  expeditedShip: string;
  oneDayShip: string;
  bestOffer: string;
  buyItNow: string;
  listingType: string;
  gift: string;
  watchCount: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front-end-app';

  errorsList: string[] = [];
  keyWords: string = '';
  minPrice: string;
  maxPrice: string;

  isNew: boolean = false;
  isVGood: boolean = false;
  isGood: boolean = false;
  isUsed: boolean = false;
  isAcceptable: boolean = false;

  isReturnAccepted: boolean = false;

  isFreeShipping: boolean = false;
  isExpeditedShipping: boolean = false;

  resultsObj;
  itemsList: Item[] = [];

  defaultValue = "Best Match";
  sortByValues: SortBy[] = [
    { text: "Best Match", value: "BestMatch"},
    {text: "Price: highest first", value : "CurrentPriceHighest"},
    {text: "Price + Shipping: highest first", value : "PricePlusShippingHighest"},
    {text: "Price + Shipping: lowest first", value : "PricePlusShippingLowest"}
  ];

  sortByValueStrings: String[] = [
    "Best Match", "Price: highest first", "Price + Shipping: highest first", "Price + Shipping: lowest first"
  ];

  selectedSortByValue: String = this.defaultValue;
  config: any;

  constructor(private ebayService: EbayService) {}

  handleResults(): void {
    let numResults = this.resultsObj.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0];

    if (Number(numResults) == 0) {
      this.errorsList.push("No exact matches found");
    } else {
      this.config = {
        itemsPerPage: 5,
        currentPage: 1
      };

      var items = this.resultsObj.findItemsAdvancedResponse[0].searchResult[0].item;
      console.log(items.length);

      let temp : Item[] = [];

      let numberVal = 0;
      items.forEach(function (value) {
          var imageUrl = value.galleryURL[0];
          
          if (imageUrl === "https://thumbs1.ebaystatic.com/pict/04040_0.jpg") {
              imageUrl = "assets/ebayDefault.png";
          } 
          
          var item = {
            id : numberVal,
            showDetails : false,
            title : value.title[0],
            price : value.sellingStatus[0].convertedCurrentPrice[0].__value__,
            from : value.location[0],
            category : value.primaryCategory[0].categoryName[0],
            condition : value.condition[0].conditionDisplayName[0],
            image : imageUrl,
            url : value.viewItemURL[0],
            shippingType : value.shippingInfo[0].shippingType[0],
            shippingCost : value.shippingInfo[0].shippingServiceCost[0].__value__,
            shipToLocations : value.shippingInfo[0].shipToLocations[0],
            expeditedShip : value.shippingInfo[0].expeditedShipping[0],
            oneDayShip : value.shippingInfo[0].oneDayShippingAvailable[0],
            bestOffer : value.listingInfo[0].bestOfferEnabled[0],
            buyItNow : value.listingInfo[0].buyItNowAvailable[0],
            listingType : value.listingInfo[0].listingType[0],
            gift : value.listingInfo[0].gift[0],
            watchCount : value.listingInfo[0].watchCount[0]
        };

        temp.push(item);
        numberVal += 1;

      });

      temp.forEach(val => this.itemsList.push(Object.assign({}, val)));
    }
  }

  public search(): void {
    console.log("got here");

    this.validateForm();

    if (this.errorsList.length == 0) {
      var query = this.prepareQuery();

      this.ebayService.searchResults(query).subscribe((data: string) => {
        result: data['findItemsAdvancedResponse']
        let responseModel = data;
        console.log(responseModel);

        this.resultsObj = JSON.parse(JSON.stringify(responseModel));
        console.log(this.resultsObj.findItemsAdvancedResponse[0].ack);
        this.handleResults();

      },
        (error) => {
          console.log("error occurred");
        });
    }

    console.log("got there");
  }

  prepareQuery(): string {

    let tempSelectedSortBy : SortBy;
    tempSelectedSortBy = this.sortByValues.find(x => x.text == this.selectedSortByValue);
    let params = [];
    params.push("keywords=" + encodeURI(this.keyWords));
    params.push("paginationInput.entriesPerPage=25");
    params.push("sortOrder=" + tempSelectedSortBy.value);

    let itemIndex = 0;

    if (this.minPrice) {
      params.push("itemFilter(" + itemIndex + ").name=MinPrice");
      params.push("itemFilter(" + itemIndex + ").value=" + this.minPrice);
      params.push("itemFilter(" + itemIndex + ").paramName=Currency");
      params.push("itemFilter(" + itemIndex + ").paramValue=USD");
      itemIndex = itemIndex + 1;
    }

    if (this.maxPrice) {
      params.push("itemFilter(" + itemIndex + ").name=MaxPrice");
      params.push("itemFilter(" + itemIndex + ").value=" + this.maxPrice);
      params.push("itemFilter(" + itemIndex + ").paramName=Currency");
      params.push("itemFilter(" + itemIndex + ").paramValue=USD");
      itemIndex = itemIndex + 1;
    }

    if (this.isNew || this.isUsed || this.isVGood || this.isGood || this.isAcceptable){
        params.push("itemFilter(" + itemIndex + ").name=Condition");

        var conditionIndex = 0;

        if (this.isNew) {
            params.push("itemFilter(" + itemIndex + ").value(" + conditionIndex + ")=1000");
            conditionIndex = conditionIndex + 1;
        }

        if (this.isUsed) {
            params.push("itemFilter(" + itemIndex + ").value(" + conditionIndex + ")=3000");
            conditionIndex = conditionIndex + 1;
        }

        if (this.isVGood) {
            params.push("itemFilter(" + itemIndex + ").value(" + conditionIndex + ")=4000");
            conditionIndex = conditionIndex + 1;
        }

        if (this.isGood) {
            params.push("itemFilter(" + itemIndex + ").value(" + conditionIndex + ")=5000");
            conditionIndex = conditionIndex + 1;
        }

        if (this.isAcceptable) {
            params.push("itemFilter(" + itemIndex + ").value(" + conditionIndex + ")=6000");
            conditionIndex = conditionIndex + 1;
        }

        itemIndex = itemIndex + 1;
    }

    params.push("itemFilter(" + itemIndex + ").name=ReturnsAcceptedOnly");

    if (this.isReturnAccepted) {
        params.push("itemFilter(" + itemIndex + ").value=true");
    } else {
        params.push("itemFilter(" + itemIndex + ").value=false");
    }

    itemIndex = itemIndex + 1;

    params.push("itemFilter(" + itemIndex + ").name=FreeShippingOnly");

    if (this.isFreeShipping) {
        params.push("itemFilter(" + itemIndex + ").value=true");
    } else {
        params.push("itemFilter(" + itemIndex + ").value=false");
    }

    itemIndex = itemIndex + 1;

    if (this.isExpeditedShipping) {
        params.push("itemFilter(" + itemIndex + ").name=ExpeditedShippingType");
        params.push("itemFilter(" + itemIndex + ").value=Expedited");
        itemIndex = itemIndex + 1;
    }

    let query = params.join("&");
    console.log(query);

    return query;
  }

  public reset(): void {
    this.keyWords = "";
    this.minPrice = "";
    this.maxPrice = "";
    this.errorsList = [];
    this.selectedSortByValue = this.defaultValue;
    this.itemsList = [];
    this.resultsObj = null;
  }

  public validateForm(): void {
    this.errorsList = [];

    if (this.keyWords == '') {
      this.errorsList.push("Please enter a key word");
    }

    if (this.minPrice != "" || this.maxPrice != "") {
      if ((this.minPrice != "" && Number(this.minPrice) < 0) || (this.maxPrice != "" && Number(this.maxPrice) < 0)) {
        this.errorsList.push("Please use appropriate values for minPrice/maxPrice");
      } else if ((this.minPrice != "" && this.maxPrice != "") && Number(this.minPrice) > Number(this.maxPrice)) {
        this.errorsList.push("Please use appropriate values for minPrice/maxPrice");
      }
    }

  }

  pageChanged(event){
    this.config.currentPage = event;
  }

  toggleDetails(id : number): void{
    let item =  this.itemsList.filter(x => x.id == id)[0];
    let status = item.showDetails;
    item.showDetails = ! status;
  }
}
