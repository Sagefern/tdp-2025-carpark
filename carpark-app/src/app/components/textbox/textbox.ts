import {Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe, CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environment';

const url = environment.supabaseUrl;
@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe, MatSelectModule, CommonModule],
  templateUrl: './textbox.html',
  styleUrls: ['./textbox.scss']
})
export class Textbox implements OnInit {
  myControl = new FormControl('');
  filteredOptions!: Observable<string[]>;

  // autocomplete options (from API)
  carparkOptions: string[] = [];

  // ✅ region options + selected come from parent
  @Input() options: { label: string; value: string }[] = [];
  @Input() selected: string = '';
  @Output() selectedChange = new EventEmitter<string>();

  @Output() nameChange = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${url}/api/carparks`).subscribe({
      next: data => {
        this.carparkOptions = data.map(i => i.name);
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(v => this._filter(v || ''))
        );
      },
      error: err => console.error('Failed to load carpark options:', err)
    });

    this.myControl.valueChanges.subscribe(v => this.nameChange.emit(v || ''));
  }

  onRegionSelected(value: string) {
    this.selectedChange.emit(value);
  }

  private _filter(value: string): string[] {
    const f = value.toLowerCase();
    return this.carparkOptions.filter(o => o.toLowerCase().includes(f));
  }
}