'use strict';

const fs = require('fs');
const folder = './jsonFiles/';
var _ = require('lodash');
var excel = require('exceljs');


fs.readdir(folder, (err, files) => {
  files.forEach(file => {
    let parseFile = parsedFile(folder + file)
    let toExcel = orderJson(parseFile)
    let generate = generateNewExcel(toExcel)
  });
});

const parsedFile = (file) => {
  return JSON.parse(fs.readFileSync(file));
}

const orderJson = (arg) => {
  let orderInfo = _.map(arg.value, function(data, i){
    return {
      Id: data.QueueID,
      Status: data.Status,
      Pais: data["Specific Content"].Pais,
      Formato: data["Specific Content"].Formato,
      NumeroTienda: data["Specific Content"].NumeroTienda?
                    data["Specific Content"].NumeroTienda: data["Specific Content"].NumeoTienda,
      NombreTienda: data["Specific Content"].NombreTienda,
      Content: {
          Clasificacion: data["Specific Content"].Clasificacion,
          Departamento: data["Specific Content"].Departamento,
          Categoria: data["Specific Content"].Categoria
      }
    }
  });
  let groupStore = _.chain(orderInfo).groupBy("NumeroTienda").transform(function (result, value, key){
    let nameStore = value[0].NombreTienda;
    let country = value[0].Pais;
    let format = value[0].Formato;
    let statusGroup = _.groupBy(value, "Status");
    result.push({numeroTienda: key, status: statusGroup, name: nameStore, country: country, format: format})
  },[]).value();
  return groupStore;
}

const generateNewExcel = (arg) => {
  let createWB = _.map(arg, function(data,llave){
    var workbook = new excel.Workbook();
    var storeSheet = workbook.addWorksheet('Tienda');
    storeSheet.columns = [{header: 'Pais', key: 'Pais'}, {header: 'Tienda', key: 'Tienda'},{header: 'Nombre', key: 'Nombre'}, {header: 'Formato', key: 'Formato'}]
    storeSheet.addRow({Pais: data.country, Tienda: data.numeroTienda, Nombre: data.name, Formato: data.format});
    let statusArray = _.map(data.status, function(value,key){
        let deptoSheet = workbook.addWorksheet(key);
        deptoSheet.columns = [{header: 'Clasificacion', key: 'Clasificacion'}, {header: 'Depto', key: 'Depto'}, {header: 'Categoria', key: 'Categoria'}]
        let aux = _.map(value, function(val,k){
            deptoSheet.addRow({Clasificacion: val.Content.Clasificacion, Depto: val.Content.Depto, Categoria: val.Content.Categoria})
        })
    })
    console.log(data.numeroTienda)
    workbook.xlsx.writeFile("./"+data.name+".xlsx").then(function() {
      console.log("xls file is written.");
    });
  });

}
