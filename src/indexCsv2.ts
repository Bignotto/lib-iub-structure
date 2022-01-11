import path from "path";
import fs from "fs/promises";
import { json2csvAsync } from "json-2-csv";

import IubStructure from "./lib/IubStructure";

import { list } from "./products2022";

var iubStruct: IubStructure;

//type Structures = StructLine & { productCode: string };
interface Structures {
  level: number;
  ItemPaiIub: string;
  InsumoCusto: number;
  InsumoPreco: number;
  DescricaoItem: string;
  Insumo: string;
  InsumoQuantidade: number;
  InsumoDescricao: string;
  InsumoTipoProduto: string;
  TipoLinha: string;
  productCode: string;
  productIub: string;
}

const load = async () => {
  const inputs_file = path.resolve(__dirname, "data", "roteiros.csv");
  const prices_file = path.resolve(__dirname, "data", "precos.csv");

  const outputPath = path.resolve(__dirname, "output");

  iubStruct = await IubStructure.CreateIubStructureCSV(
    inputs_file,
    prices_file
  );

  let structs: Structures[] = [];

  list.forEach(async (item) => {
    const struct = iubStruct.getIubStructBySap(item);

    struct.forEach((line) => {
      //if (line.Insumo !== null) {
      structs.push({
        level: line.level,
        ItemPaiIub: line.ItemPaiIub,
        InsumoCusto: line.InsumoCusto,
        InsumoPreco: line.InsumoPreco,
        DescricaoItem: line.DescricaoItem,
        Insumo: line.Insumo,
        InsumoQuantidade: line.InsumoQuantidade,
        InsumoDescricao: line.InsumoDescricao,
        InsumoTipoProduto: line.InsumoTipoProduto,
        TipoLinha: line.TipoLinha,
        productCode: item.toUpperCase(),
        productIub: struct[0].ItemPaiIub,
      });
      //}
    });
  });

  const csvString = await json2csvAsync(structs, {
    delimiter: {
      field: ";",
    },
    excelBOM: true,
  });

  const outputFile = path.resolve(outputPath, `estruturas2022.csv`);
  await fs.writeFile(outputFile, csvString, "utf-8");

  return;
};

load();

// [x] recursive function to filter inputs for a given product
//    [x] by sap code
//    [x] should be able to accept both character cases
// [x] get prices from a prices list
// [x] save csv file to open in excel
//    [x] fix foreign characters
// [x] write results as csv file
