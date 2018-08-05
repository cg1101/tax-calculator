import { Component, OnInit } from '@angular/core';
import { TaxRecord } from '../tax-record';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  records: TaxRecord[] = [];

  constructor() { }

  ngOnInit() {
  }

}
