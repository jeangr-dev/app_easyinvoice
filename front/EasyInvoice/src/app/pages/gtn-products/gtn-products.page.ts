import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonModal } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-gtn-products',
  templateUrl: './gtn-products.page.html',
  styleUrls: ['./gtn-products.page.scss'],
})
export class GtnProductsPage implements OnInit {

  id_producto!: string;
  codigo_barras!: string;
  nom_producto!: string;
  descrip_prod!: string;
  id_prom_pro!: string;
  id_cat_pro!: string;
  unidades_dispon!: string;
  precio!: string;

  prom_pro!: string;
  categ_pro!: string;

  isDisabledBtnElim: boolean = true;
  isDisabledInpCodProd!: boolean;

  @ViewChild('modalForm') modalForm!: IonModal;
  @ViewChild('modalDtProd') modalDtProd!: IonModal;
  @ViewChild('modalFormCateg') modalFormCateg!: IonModal;
  @ViewChild('modalFormIVA') modalFormIVA!: IonModal;

  showBackdrop: boolean = false;

  itemsClieFilterAux: any[] = [];
  items: any[] = [];
  private listWithOutFilter: any[] = [];

  selectedItems: any[] = [];
  selectedItem!: any;

  titleModalForm!: string;
  nameBtnModalForm!: string;

  optionsCateg!: any[];
  optionsIva!: any[];
  optionsProm!: any[];
  selectedOptionCateg: any;
  selectedOptionIVA: any;
  selectedOptionProm: any;

  selectedOptCategGtn: any;
  selectedOptIVAGtn: any;
  nom_categ!: string;
  descr_categ!: string;
  btnNameGtnCateg: string = "Registrar";
  btnNameGtnIVA: string = "Registrar";
  nom_iva!: string;
  valor_iva!: any;

  constructor(private http: HttpClient, private toastController: ToastController) {
    this.recoverCategories();
    this.recoverCategIva();
    this.recoverCategProm();
    this.loadProducts();
  }

  async alertInsertCorrectly() {
    const toast = await this.toastController.create({
      message: 'Se registrado correctamente',
      duration: 3000, // Duración en milisegundos
      position: 'bottom' // Posición del mensaje ('top', 'middle', o 'bottom')
    });
    toast.present();
  }

  async alertInputEmpty() {
    const toast = await this.toastController.create({
      message: 'Todos los campos son obligatorios',
      duration: 3000, // Duración en milisegundos
      position: 'bottom', // Posición del mensaje ('top', 'middle', o 'bottom')
      color: 'danger' // Color del mensaje de error
    });
    toast.present();
  }

  async alertCodBarras() {
    const toast = await this.toastController.create({
      message: 'El código ingresado ya existe',
      duration: 3000, // Duración en milisegundos
      position: 'bottom', // Posición del mensaje ('top', 'middle', o 'bottom')
      color: 'danger' // Color del mensaje de error
    });
    toast.present();
  }

  openModalForm() {
    this.modalForm.present();
  }

  closeModalForm() {
    this.clearInputs()
    this.modalForm.dismiss()
  }

  openModalFormCateg() {
    this.modalFormCateg.present();
  }

  openModalFormIVA() {
    this.modalFormIVA.present();
  }

  closeModalFormCateg() {
    this.modalFormCateg.dismiss();
    this.clearSelectionCategGtn();
  }

  closeModalFormIVA() {
    this.modalFormIVA.dismiss();
    this.clearSelectionIVAGtn();
  }

  openModalDtProd(item: any) {
    this.getPromocPro(item);
    this.getCategPro(item);
    this.selectedItem = item;
    this.modalDtProd.present();
  }

  closeModalDtProd() {
    this.modalDtProd.dismiss();
  }

  getPromocPro(product: any) {
    const url = 'http://localhost:8080/promotion/' + product['id_promocion'];
    this.http.get<any[]>(url).subscribe(
      (response: any) => {
        if (response !== null) {
          this.prom_pro = response.nom_prom;
        }
      },
      (error) => {
        console.error('Error al recuperar promoción:', error);
      }
    );
  }

  insertCategoria() {
    if (this.isEmptyInputGtnCateg(this.nom_categ, this.descr_categ)) {
      const url = "http://localhost:8080/category/save-category"
      const categData = JSON.stringify({
        nom_categ: this.nom_categ,
        descrip_categ: this.descr_categ,
        est_categ: 1,
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      this.http.post(url, categData, { headers }).subscribe(
        (response) => {
          if (response != null) {
            this.alertInsertCorrectly();
            this.closeModalFormCateg();
            this.recoverCategories();
            this.clearSelectionCategGtn();
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  modificarCategoria(id: string) {
    if (this.isEmptyInputGtnCateg(this.nom_categ, this.descr_categ)) {

      const url = 'http://localhost:8080/category/modif-category/' + id;

      const dataCateg = JSON.stringify({
        nom_categ: this.nom_categ,
        descrip_categ: this.descr_categ,
        parent_id: null,
      });

      const headers = {
        'Content-Type': 'application/json',
      };

      this.http.put(url, dataCateg, { headers }).subscribe(
        (response: any) => {
          this.alertInsertCorrectly();
          this.closeModalFormCateg();
          this.recoverCategories();
          this.clearSelectionCategGtn();
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  insertIVA() {
    if (this.isEmptyInputGtnIVA(this.nom_iva, this.valor_iva)) {
      const url = "http://localhost:8080/iva/save-iva"
      const ivaData = JSON.stringify({
        nomb_categ_iva: this.nom_iva,
        valor: this.valor_iva,
        est_categ_iva: 1,
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      this.http.post(url, ivaData, { headers }).subscribe(
        (response) => {
          if (response != null) {
            this.alertInsertCorrectly();
            this.closeModalFormIVA();
            this.recoverCategIva();
            this.clearSelectionIVAGtn();
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  modificarIVA(id: string) {
    if (this.isEmptyInputGtnCateg(this.nom_iva, this.valor_iva)) {

      const url = 'http://localhost:8080/iva/modif-iva/' + id;

      const dataIVA = JSON.stringify({
        nomb_categ_iva: this.nom_iva,
        valor: this.valor_iva,
        est_categ_iva: 1,
      });

      const headers = {
        'Content-Type': 'application/json',
      };

      this.http.put(url, dataIVA, { headers }).subscribe(
        (response: any) => {
          this.alertInsertCorrectly();
          this.closeModalFormIVA();
          this.recoverCategIva();
          this.clearSelectionIVAGtn();
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  selectCategChange() {
    if (this.selectedOptCategGtn) {
      this.getCategId(this.selectedOptCategGtn);
    }
  }

  selectIVAChange() {
    if (this.selectedOptIVAGtn) {
      this.getIVAId(this.selectedOptIVAGtn);
    }
  }

  getCategId(id: string) {
    const url = 'http://localhost:8080/category/' + id;
    this.http.get<any[]>(url).subscribe(
      (response: any) => {
        if (response !== null) {
          this.nom_categ = response.nom_categ;
          this.descr_categ = response.descrip_categ;
          this.btnNameGtnCateg = "Modificar"
          this.isDisabledBtnElim = false;
        }
      },
      (error) => {
        console.error('Error al recuperar promoción:', error);
      }
    );
  }

  getIVAId(id: string) {
    const url = 'http://localhost:8080/iva/' + id;
    this.http.get<any[]>(url).subscribe(
      (response: any) => {
        if (response !== null) {
          this.nom_iva = response.nomb_categ_iva;
          this.valor_iva = response.valor;
          this.btnNameGtnIVA = "Modificar"
          this.isDisabledBtnElim = false;
        }
      },
      (error) => {
        console.error('Error al recuperar promoción:', error);
      }
    );
  }

  handleBtnGtnCateg() {
    if (this.btnNameGtnCateg === 'Registrar') {
      this.insertCategoria();
    } else {
      this.modificarCategoria(this.selectedOptCategGtn);
    }
  }

  handleBtnGtnIVA() {
    if (this.btnNameGtnIVA === 'Registrar') {
      this.insertIVA();
    } else {
      this.modificarIVA(this.selectedOptIVAGtn);
    }
  }

  handleBtnFormProd() {
    if (this.nameBtnModalForm === 'Crear Producto') {
      this.insertProduct();
    } else  {
      this.updateProduct(this.id_producto);
    }
  }

  getCategPro(product: any) {
    const url = 'http://localhost:8080/category/' + product['id_categ'];
    this.http.get<any[]>(url).subscribe(
      (response: any) => {
        if (response !== null) {
          this.categ_pro = response.nom_categ;
        }
      },
      (error) => {
        console.error('Error al recuperar promoción:', error);
      }
    );
  }

  addProducts() {
    this.titleModalForm = "Nuevo Producto";
    this.nameBtnModalForm = "Crear Producto";
    this.isDisabledInpCodProd = false;
    this.openModalForm();
  }

  setTitleFormProd() {
    this.titleModalForm = "Modificar Producto";
    this.nameBtnModalForm = "Modificar Producto";
    this.isDisabledInpCodProd = true;
    this.openModalForm();
  }

  selectItem(item: any) {
    const index = this.selectedItems.indexOf(item);
    if (index > -1) {
      this.selectedItems.splice(index, 1); // Deseleccionar elemento si ya está seleccionado
    } else {
      this.selectedItems.push(item); // Seleccionar elemento si no está seleccionado
    }
  }

  isSelected(item: any): boolean {
    return this.selectedItems.indexOf(item) > -1;
  }

  vender() {
    // Aquí puedes capturar la información de los elementos seleccionados y realizar las acciones necesarias
    console.log(this.selectedItems);
  }

  ngOnInit() {

  }

  clearInputs() {
    this.codigo_barras = "";
    this.nom_producto = "";
    this.descrip_prod = "";
    this.precio = "";
    this.unidades_dispon = "";
    this.clearSelectionCateg();
    this.clearSelectionIVA();
    this.clearSelectionProm();
  }

  clearInputsGtnCateg() {
    this.nom_categ = "";
    this.descr_categ = ""
  }

  clearInputsGtnIVA() {
    this.nom_iva = "";
    this.valor_iva = ""
  }

  isEmptyInputGtnCateg(nom_categ: string, descr_categ: string) {
    if (!nom_categ || !descr_categ || /^\s+|\s+$/g.test(nom_categ)
      || /^\s+|\s+$/g.test(descr_categ)) {
      this.alertInputEmpty();
      return false;
    } else {
      return true;
    }
  }

  isEmptyInputGtnIVA(nom_iva: string, valor_iva: any) {
    if (!nom_iva || !valor_iva || /^\s+|\s+$/g.test(nom_iva)
      || /^\s+|\s+$/g.test(valor_iva)) {
      this.alertInputEmpty();
      return false;
    } else {
      return true;
    }
  }

  isEmptyInput(codigo_barras: string, nom_producto: string, descrip_prod: string, precio: string,
    unidades_dispon: string, selectedOptionCateg: string, selectedOptionIVA: string, selectedOptionProm: string) {

    if (!codigo_barras || !nom_producto || !descrip_prod || !precio || !unidades_dispon
      || /^\s+|\s+$/g.test(codigo_barras) || /^\s+|\s+$/g.test(nom_producto) || /^\s+|\s+$/g.test(descrip_prod)
      || /^\s+|\s+$/g.test(precio) || /^\s+|\s+$/g.test(unidades_dispon)
      || selectedOptionCateg === undefined || selectedOptionIVA === undefined || selectedOptionProm === undefined) {
      this.alertInputEmpty();
      return false;
    } else {
      return true;
    }
  }

  validateCodProd(codigo_barras: string) {
    for (const item of this.items) {
      if (item.codigo_barras === codigo_barras) {
        return false;
      }
    }
    return true;
  }

  insertProduct() {
    if (this.isEmptyInput(this.codigo_barras, this.nom_producto, this.descrip_prod, this.precio,
      this.unidades_dispon, this.selectedOptionCateg, this.selectedOptionIVA, this.selectedOptionProm)) {

      if (this.validateCodProd(this.codigo_barras)) {
        const url = 'http://localhost:8080/product/save-product';
        const id_categ = this.selectedOptionCateg;
        const id_promocio = this.selectedOptionProm;
        const id_categ_iva = this.selectedOptionIVA;
        const productData = JSON.stringify({
          id_promocion: id_promocio,
          id_categ: id_categ,
          id_categ_iva: id_categ_iva,
          nom_producto: this.nom_producto,
          descrip_prod: this.descrip_prod,
          precio: this.precio,
          unidades_dispon: this.unidades_dispon,
          codigo_barras: this.codigo_barras,
          est_producto: 1,
        });

        const headers = {
          'Content-Type': 'application/json'
        };

        this.http.post(url, productData, { headers }).subscribe(
          (response) => {
            if (response != null) {
              this.alertInsertCorrectly;
              this.closeModalForm();
              this.loadProducts();
            }
          },
          (error) => {
            console.error(error);
          }
        );
      } else {
        this.alertCodBarras();
        this.codigo_barras = "";
      }
    }
  }

  updateProduct(id_prod: string) {
    if (this.isEmptyInput(this.codigo_barras, this.nom_producto, this.descrip_prod, this.precio,
      this.unidades_dispon, this.selectedOptionCateg, this.selectedOptionIVA, this.selectedOptionProm)) {

        const url = 'http://localhost:8080/product/modif-product/' + id_prod;
        const id_categ = this.selectedOptionCateg;
        const id_promocio = this.selectedOptionProm;
        const id_categ_iva = this.selectedOptionIVA;

        const dataProd = JSON.stringify({
          id_promocion: id_promocio,
          id_categ: id_categ,
          id_categ_iva: id_categ_iva,
          nom_producto: this.nom_producto,
          descrip_prod: this.descrip_prod,
          precio: this.precio,
          unidades_dispon: this.unidades_dispon,
          codigo_barras: this.codigo_barras,
        });
  
        const headers = {
          'Content-Type': 'application/json',
        };

        this.http.put(url, dataProd, { headers }).subscribe(
          (response: any) => {
            this.alertInsertCorrectly();
            this.closeModalForm();
            this.loadProducts();
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  loadProducts() {
    const url = 'http://localhost:8080/product/get-products';
    this.http.get<any[]>(url).subscribe(
      (response) => {
        if (response !== null) {
          this.items = response.filter(prod => prod.est_producto !== 0);
          this.listWithOutFilter = this.items;
        }
      },
      (error) => {
        console.error('Error al recuperar ciudades:', error);
      }
    );
  }

  recoverCategories() {
    const url = "http://localhost:8080/category/get-category";
    this.http.get<any[]>(url).subscribe(
      (response: any[]) => {
        if (response !== null) {
          this.optionsCateg = response.filter(ctg => ctg.est_categ !== 0);
        }
      },
      (error) => {
        console.error('Error al recuperar ciudades:', error);
      }
    );
  }

  recoverCategIva() {
    const url = "http://localhost:8080/iva/get-iva";
    this.http.get<any[]>(url).subscribe(
      (response) => {
        if (response !== null) {
          this.optionsIva = response.filter(iva => iva.est_categ_iva !== 0);
        }
      },
      (error) => {
        console.error('Error al recuperar ciudades:', error);
      }
    );
  }

  recoverCategProm() {
    const url = "http://localhost:8080/promotion/get-promotion";
    this.http.get<any[]>(url).subscribe(
      (response) => {
        if (response !== null) {
          this.optionsProm = response.filter(prom => prom.est_prom !== 0);
        }
      },
      (error) => {
        console.error('Error al recuperar ciudades:', error);
      }
    );
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.trim() !== '') {
      this.items = this.items.filter(item =>
        item.nom_producto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.items = this.listWithOutFilter;
    }
  }

  clearSelectionCateg() {
    this.selectedOptionCateg = null;

  }
  clearSelectionCategGtn() {
    this.selectedOptCategGtn = null;
    this.btnNameGtnCateg = "Registrar"
    this.isDisabledBtnElim = true;
    this.clearInputsGtnCateg();
  }

  clearSelectionIVAGtn() {
    this.selectedOptIVAGtn = null;
    this.btnNameGtnIVA = "Registrar"
    this.isDisabledBtnElim = true;
    this.clearInputsGtnIVA();
  }

  clearSelectionIVA() {
    this.selectedOptionIVA = null;
  }

  clearSelectionProm() {
    this.selectedOptionProm = null;
  }

  goBack() {
    this.closeModalForm();
  }

  deleteItem(item: any) {

  }

  editItem(item: any) {
    this.loadDataProd(item);
    this.setTitleFormProd();
  }

  loadDataProd(item: any) {
    this.id_producto = item.id_producto;
    this.codigo_barras = item.codigo_barras;
    this.nom_producto = item.nom_producto;
    this.descrip_prod = item.descrip_prod;
    this.precio = item.precio;
    this.unidades_dispon = item.unidades_dispon;
    this.selectedOptionCateg = item.id_categ;
    this.selectedOptionIVA = item.id_categ_iva;
    this.selectedOptionProm = item.id_promocion;
  }

  toggleBackdrop() {
    this.showBackdrop = !this.showBackdrop;
  }
}
