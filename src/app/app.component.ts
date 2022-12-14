import { Component } from '@angular/core';
import dataObj from '../assets/api-response.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rouse-challenge';
  data: DataPoint[];
  modelId: string | undefined;
  year: string | undefined;
  selectedModel: DataPoint | undefined;
  selectedModelYear: Year | undefined;
  marketValue: number | undefined;
  auctionValue: number | undefined;
  error: ErrorMessage | undefined

  errorMessages: ErrorMessage[] = [
    {code: 'NOMODEL', message: 'No model was found with that ID'},
    {code: 'NOYEAR', message: 'No year has been specified'},
  ]
  estimate: boolean = false

  constructor() {
    this.data = []

    // just going to massage the data a bit so that I can use an array with clean types
    const keys = Object.keys(dataObj) as (keyof typeof dataObj)[];
    keys.forEach((id) => {
      const dataPoint = dataObj[id]
      this.data.push({
        id,
        data: dataPoint
      });
    });
  }

  selectModel() { 
    this.selectedModel = this.data.filter((d) => d.id === this.modelId)[0]
    this.marketValue = undefined
    this.auctionValue = undefined
    this.estimate = false
    this.setErrorState((this.selectedModel) ? undefined : "NOMODEL" )
  }

  selectModelYear() { 
    if (this.year) {
      this.selectedModelYear = this.selectedModel?.data.schedule.years[this.year]
      if (!this.selectedModelYear) {
        this.estimateValue()
      }
    } else {
      this.setErrorState('NOYEAR')
    }
    if (this.selectedModel && this.selectedModelYear) {
      this.estimate = false
      let cost = this.selectedModel.data.saleDetails.cost
      this.marketValue = cost * this.selectedModelYear.marketRatio
      this.auctionValue = cost * this.selectedModelYear.auctionRatio
    }
  }

  setErrorState(code: string | undefined) {
    this.error = (code) ? this.errorMessages.filter(e => e.code === code)[0] : undefined
  }

  // this method is only used by the set data buttons
  setYearId(year: string, id: string) {
    this.modelId = id
    this.selectModel()
    this.year = year
    this.selectModelYear()
  }

  estimateValue() {
    if (this.selectedModel) {
      let cost = this.selectedModel.data.saleDetails.cost
      let defaultAuctionRatio = this.selectedModel.data.schedule.defaultAuctionRatio
      let defaultMarketRatio = this.selectedModel.data.schedule.defaultMarketRatio
      let years: any[] = []
      const keys = Object.keys(this.selectedModel.data.schedule.years) as (keyof typeof this.selectedModel.data.schedule.years)[];
      keys.forEach((id) => {
        years.push({year: id, data: this.selectedModel?.data.schedule.years[id]});
      });

      //TODO: don't trust the data, sort it
      // const sortedYears = years.sort((year) => { 
      //   return year.
      // })

      this.estimate = true
      if(this.year){
        const yearDiff = Math.abs(parseInt(this.year) - parseInt(years[0].year))
        //TODO:  this isn't correct!
        this.marketValue = cost * (years[0].data.marketRatio * (defaultMarketRatio / yearDiff))
        this.auctionValue = cost * (years[0].data.auctionRatio * (defaultAuctionRatio / yearDiff))
      }
    }
  }
}

interface DataPoint  {
  id: string,
  data: {
    schedule: {
      years: any;
      defaultMarketRatio: number;
      defaultAuctionRatio: number;
    };
    saleDetails: {
      cost: number;
      retailSaleCount: number;
      auctionSaleCount: number;
    };
    classification: {
      category: string;
      subcategory: string;
      make: string;
      model: string;
    };
  };
};

interface Year {
    year: string
    marketRatio: number;
    auctionRatio: number;
};

interface ErrorMessage {
  code: string;
  message: string;
}