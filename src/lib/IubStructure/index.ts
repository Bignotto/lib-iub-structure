import { Low, JSONFile } from "lowdb";
import { InputLine } from "./models/IInputLine";
import { StructLine } from "./models/IStructLine";

type IIubStructure = {
  inputLine: InputLine[];
};

export default class IubStructure {
  public inputs: InputLine[];

  private async load(datafile: string): Promise<InputLine[]> {
    const adapter = new JSONFile<IIubStructure>(datafile);
    const inputs_file = new Low<IIubStructure>(adapter);

    await inputs_file.read();
    return inputs_file.data?.inputLine ?? [];
  }

  public static CreateIubStructure = async (datafile: string) => {
    const iub = new IubStructure();
    iub.inputs = await iub.load(datafile);
    return iub;
  };

  public getIubStructBySap(sapCode: string, level = 0): StructLine[] {
    const safeCode = sapCode.toUpperCase();
    let struct: StructLine[] = [];

    console.log(`starting item ${safeCode} in level ${level}`);

    // [x] filter inputs by ItemPaiRoteiro
    const productStruct = this.inputs.filter(
      line => line.ItemPaiRoteiro === safeCode
    );

    // [x] for each
    productStruct.forEach(line => {
      const newLine: StructLine = {
        id: struct.length + 1,
        level,
        InsumoCusto: 1, //TODO: get prices from somewhere
        InsumoPreco: 1,
        ...line,
      };

      if (line.TipoLinha === "SERVICO") newLine.InsumoQuantidade = 1;

      struct.push(newLine);

      if (line.TipoLinha === "SUB") {
        const subStruct = this.getIubStructBySap(line.Insumo, level + 1);

        const subStructToSum = subStruct.filter(
          subLine => subLine.level === level + 1
        );
        const subCostsList = subStructToSum.map(subLine => subLine.InsumoCusto);
        const subTotalCost = subCostsList.reduce(
          (acc, value) => acc + value,
          0
        );
        struct[struct.length - 1].InsumoCusto =
          subTotalCost * newLine.InsumoQuantidade;

        struct = struct.concat(subStruct);
      }
    });

    return struct;
  }
}
