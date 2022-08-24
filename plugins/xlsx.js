import * as xlsx from 'xlsx/xlsx.mjs';

export default (context, inject) => {
  inject('xlsx', xlsx)
}
