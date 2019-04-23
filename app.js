'use strict';

const fs = require('fs');
const folder = './jsonFiles/';
var _ = require('lodash');

fs.readdir(folder, (err, files) => {
  files.forEach(file => {
    let parseFile = parsedFile(folder + file)
    let toExcel = orderJson(parseFile)
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
  console.log(groupStore)
}
