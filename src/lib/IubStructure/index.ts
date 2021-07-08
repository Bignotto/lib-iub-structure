import { Low, JSONFile } from "lowdb";
import { InputLine } from "./models/IInputLine";
import { InputPrice } from "./models/IPrice";
import { StructLine } from "./models/IStructLine";

type IIubStructure = {
  inputLine: InputLine[];
};

type IPricesList = {
  inputPrices: InputPrice[];
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

  public static CreateIubStructure = async (
    structDataFile: string,
    pricesDataFile: string
  ) => {
    const iub = new IubStructure();
    iub.inputs = await iub.loadStructData(structDataFile);
    iub.prices = await iub.loadPricesData(pricesDataFile);
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
}
