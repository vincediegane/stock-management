<template>
  <q-page>
    <q-breadcrumbs active-color="blue" style="font-size: 16px">
      <q-breadcrumbs-el icon="home" />
      <q-breadcrumbs-el />
      <span class="text-caption">Catalog</span>
    </q-breadcrumbs>
    <span class="text-subtitle2">Products</span>
    <q-card flat bordered class="my-card q-ma-sm">
      <q-card-section style="padding-right: 0; padding-left: 0; margin-right: 0; margin-left: 0;">
        <div class="row q-px-sm">
          <div class="col">
            <q-input outlined bottom-slots v-model="text" label="Search" counter clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon name="clear" />
              </template>

              <template v-slot:hint>
                SKU name
              </template>
            </q-input>
          </div>
          <div class="col q-ml-md">
            <q-checkbox v-model="inactive" label="Include Inactive" />
          </div>
        </div>
        <div class="q-mt-sm q-px-sm">
          <q-btn label="IMPORT NEW SKU(S)" icon="upload_file" outline color="blue" @click="exportTable" />
        </div>
        <div class="q-mt-sm q-mx-0">
          <table class="my-table">
            <tr>
              <th class="th-dark">No</th>
              <th class="th-blue extra">Catalog</th>
              <th class="th-dark medium">Color</th>
              <th class="th-dark medium">Size</th>
              <th class="th-dark medium">Quantity</th>
            </tr>
            <tr v-if="!rowsFiltered.length">
              <td colspan="8">
                <template>
                  <div class="full-width row flex-center text-accent q-gutter-sm">
                    <q-icon size="2em" name="sentiment_dissatisfied" />
                    <span>
                      Well this is sad... i didn't find anything for you
                    </span>
                    <q-icon size="2em" name="report_problem" />
                  </div>
                </template>
              </td>
            </tr>
            <tbody v-if="rowsFiltered.length">
              <tr v-for="item in rowsFiltered" :key="item.id">
                <td style="background-color: #dddddd;">{{ item.id }}</td>
                <td style="background-color: #dddddd;">{{ item.catalog_name }}</td>
                <td>{{ item.color }}</td>
                <td>{{ item.size }}</td>
                <td v-if="item.quantity > 0">{{ item.quantity }}</td>
                <td v-if="item.quantity < 0">
                  <q-badge color="red">
                    {{ item.quantity }} <q-icon name="warning" color="white" class="q-ml-xs" />
                  </q-badge>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-white text-right q-gutter-md" style="font-size: 2em; cursor: pointer;">
            <q-icon class="bg-blue q-pa-sm" style="border-radius: 50%;" name="refresh" @click="refresh"/>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { exportFile } from 'quasar';
import { api } from 'boot/axios'

function wrapCsvValue (val, formatFn) {
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val;

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}
export default {
  name: 'PageIndex',
  methods: {
    loadProducts () {
      api.get('/api/products')
        .then((response) => {
          this.rows = response.data.data;
        })
        .catch((err) => {
          console.error(err);
        })
    },
    exportTable () {
      // naive encoding to csv format
      const content = [ this.columns.map(col => wrapCsvValue(col.label)) ].concat(
        this.rows.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    refresh () {
      this.loadProducts();
    }
  },
  mounted() {
    this.$root.$on('message_from_main_layout', (msg) => {
      this.locationName = msg;
    });
    this.loadProducts();
  },
  computed: {
    rowsFiltered() {
      return this.rows.filter(row => row.location_name === this.locationName && (row.catalog_name.toLowerCase().indexOf(this.text) > -1 || row.color.toLowerCase().indexOf(this.text.toLowerCase()) > - 1));
    }
  },
  data () {
    return {
      locationName: '',
      text: '',
      inactive: false,
      columns: [
        {
          name: 'id',
          required: true,
          label: 'No',
          align: 'left',
          field: row => row.id,
          sortable: true
        },
        { name: 'catalog_name', align: 'center', label: 'Catalog', field: row => row.catalogName },
        { name: 'color', label: 'Color', field: row => row.color },
        { name: 'size', label: 'Size', field: row => row.size },
        { name: 'quantity', label: 'Quantity', field: row => row.quantity }
      ],
      rows: []
      // rows: [
      //   {
      //     id: 0,
      //     catalogName: '159',
      //     color: '#02',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 1,
      //     catalogName: '159',
      //     color: '#02',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD LIBREVILLE',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 2,
      //     catalogName: '159',
      //     color: '#01',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD ABIDJAN',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 3,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 4,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD LIBREVILLE',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 5,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD ABIDJAN',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 6,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 7,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 8,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 9,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 10,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 11,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 12,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 13,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 14,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 15,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 16,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 17,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 18,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 19,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   },
      //   {
      //     id: 20,
      //     catalogName: '159',
      //     color: 'VLG',
      //     size: 24,
      //     quantity: 4,
      //     locationName: 'MD DAKAR',
      //     delFlg: '',
      //     status: 'active'
      //   }
      // ],
    }
  }
}
</script>
<style lang="css" scoped>
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  td, th {
    border-bottom: 1px solid rgb(212, 210, 210);
    text-align: left;
    padding: 8px;
  }
  table tr td:first-child {
    border-left: 1px solid rgb(212, 210, 210);
  }
  table tr td:last-child {
    border-right: 1px solid rgb(212, 210, 210);
  }
  .th-dark {
    background-color: black;
    color: white;
  }
  .th-blue {
    background-color: rgb(32, 93, 150);
    color: white;
  }
  .my-table {
    width: 100%;
  }
  .extra {
    width: 900px;
  }
  .medium {
    width: 100px;
  }
</style>
