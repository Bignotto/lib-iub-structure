import { Low, JSONFile } from "lowdb";
import csv from "csvtojson";

import { InputLine } from "./models/IInputLine";
import { InputPrice } from "./models/IPrice";
import { StructLine } from "./models/IStructLine";

type IIubStructure = {
  inputLine: InputLine[];
};

type IPricesList = {
  inputPrices: InputPrice[];
};

type IubStructCost = {
  ItemPaiRoteiro: string;
  ItemPaiIub: string;
  DescricaoItem: string;
  ItemPaiTipoProduto: string;
  inputsTotalValue: number;
  timesTotalValue: number;
  inputs: StructLine[];
  times: StructLine[];
};

export default class IubStructure {
  public inputs: InputLine[];
  public prices: InputPrice[];

  private async loadStructData(datafile: string): Promise<InputLine[]> {
    const adapter = new JSONFile<IIubStructure>(datafile);
    const inputs_file = new Low<IIubStructure>(adapter);

    await inputs_file.read();
    return inputs_file.data?.inputLine ?? [];
  }

  private async loadPricesData(pricesDataFile: string): Promise<InputPrice[]> {
    const adapter = new JSONFile<IPricesList>(pricesDataFile);
    const prices_file = new Low<IPricesList>(adapter);

    await prices_file.read();
    return prices_file.data?.inputPrices ?? [];
  }

  private async loadPricesCsv(pricesCsvFile: string): Promise<InputPrice[]> {
    const data: InputPrice[] = await csv({
      delimiter: ";",
      checkType: true,
    }).fromFile(pricesCsvFile);
    return data ?? [];
  }

  private async loadInputsCsv(inputsCsvFile: string): Promise<InputLine[]> {
    const data: InputLine[] = await csv({
      delimiter: ";",
      checkType: true,
      colParser: { ItemPaiIub: "string" },
    }).fromFile(inputsCsvFile);
    return data ?? [];
  }

  public static CreateIubStructure = async (
    structDataFile: string,
    pricesDataFile: string
  ) => {
    const iub = new IubStructure();
    iub.inputs = await iub.loadStructData(structDataFile);
    iub.prices = await iub.loadPricesData(pricesDataFile);
    return iub;
  };

  public static CreateIubStructureCSV = async (
    structCsvFile: string,
    pricesCsvFile: string
  ) => {
    const iub = new IubStructure();
    iub.prices = await iub.loadPricesCsv(pricesCsvFile);
    iub.inputs = await iub.loadInputsCsv(structCsvFile);
    return iub;
  };

  public getIubStructBySap(sapCode: string, level = 0): StructLine[] {
    const safeCode = sapCode.toUpperCase();
    let struct: StructLine[] = [];

    // [x] filter inputs by ItemPaiRoteiro
    const productStruct = this.inputs.filter(
      line => line.ItemPaiRoteiro === safeCode
    );

    // [x] for each
    productStruct.forEach(line => {
      const [inputPrice] = this.prices.filter(
        itemPrice => itemPrice.Item === line.Insumo
      );

      let InsumoCusto = 0;
      let InsumoPreco = 0;

      if (inputPrice) {
        InsumoPreco = inputPrice.UltimoPreco;
        InsumoCusto =
          line.TipoLinha === "SERVICO"
            ? inputPrice.UltimoPreco
            : inputPrice.UltimoPreco * line.InsumoQuantidade;
      }

      const newLine: StructLine = {
        id: struct.length + 1,
        level,
        InsumoCusto,
        InsumoPreco,
        ...line,
      };

      if (line.TipoLinha === "SERVICO") newLine.InsumoQuantidade = 1;

      struct.push(newLine);

      if (line.TipoLinha === "SUB") {
        const subStruct = this.getIubStructBySap(line.Insumo, level + 1);

        const subStructToSum = subStruct.filter(
          subLine => subLine.level === level + 1
        );

        const subCostsList = subStructToSum.map(subLine =>
          subLine.InsumoUnidade === "DZ"
            ? Number(subLine.InsumoCusto) / 12
            : Number(subLine.InsumoCusto)
        );

        const subTotalCost = subCostsList.reduce(
          (acc, value) => acc + value,
          0
        );

        struct[struct.length - 1].InsumoCusto =
          subTotalCost * newLine.InsumoQuantidade;
        struct[struct.length - 1].InsumoPreco = subTotalCost;

        struct = struct.concat(subStruct);
      }
    });

    return struct;
  }

  public getInputsWithoutPrices(): InputPrice[] {
    const pricesZero = this.prices.filter(price => price.UltimoPreco === null);
    //console.log({ pricesZero });
    return pricesZero;
  }

  public getIubStructInputsBySap(sapCode: string): StructLine[] {
    const safeCode = sapCode.toUpperCase();
    const completeStruct = this.getIubStructBySap(safeCode);
    const onlyInputs = completeStruct.filter(line => line.Insumo !== "NULL");
    return onlyInputs;
  }

  public getIubStructTimesBySap(sapCode: string): StructLine[] {
    const safeCode = sapCode.toUpperCase();
    const completeStruct = this.getIubStructBySap(safeCode);
    const onlyTimes = completeStruct.filter(line => line.Insumo === "NULL");
    return onlyTimes;
  }

  public getIubStructCostBySap(sapCode: string): IubStructCost {
    const safeCode = sapCode.toUpperCase();
    const completeStruct = this.getIubStructBySap(safeCode);
    const onlyTimes = completeStruct.filter(line => line.Insumo === "NULL");
    const onlyInputs = completeStruct.filter(line => line.Insumo !== "NULL");

    const linesToSum = completeStruct.filter(line => line.level === 0);
    const valuesToSum = linesToSum.map(line => line.InsumoCusto);
    const structInputsTotalValue = valuesToSum.reduce((acc, v) => acc + v);

    const workloadStruct = completeStruct.filter(
      line => line.TipoLinha === "RECURSO"
    );

    const workloadValues = workloadStruct.map(
      line => Number(line.RecursoTempo) * Number(line.RecursoCustoHora)
    );

    const workloadTotal = workloadValues.reduce((acc, v) => acc + v, 0);

    return {
      ItemPaiIub: completeStruct[0].ItemPaiIub,
      DescricaoItem: completeStruct[0].DescricaoItem,
      ItemPaiRoteiro: completeStruct[0].ItemPaiRoteiro,
      ItemPaiTipoProduto: completeStruct[0].ItemPaiTipoProduto,
      inputsTotalValue: structInputsTotalValue,
      timesTotalValue: workloadTotal,
      inputs: onlyInputs,
      times: onlyTimes,
    };
  }
}
