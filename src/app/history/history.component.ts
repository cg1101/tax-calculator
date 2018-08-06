import { Component, OnInit } from '@angular/core';
import { TaxRecord } from '../tax-record';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  records: TaxRecord[] = [];

  constructor(protected backend: BackendService) { }

  ngOnInit() {
    this.backend.loadHistory().subscribe(resp => {
      console.log('history component received', resp);
      this.records = [...resp.body.history];
    });
  }

  remove(index) {
    this.backend.deleteRecord(index).subscribe(resp => {
      console.log('delete response', resp);
      this.records.splice(index, 1);
    });
  }
}
