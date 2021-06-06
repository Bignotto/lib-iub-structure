import { Low, JSONFile } from "lowdb";
import { InputLine } from "./models/IInputLine";

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
}
