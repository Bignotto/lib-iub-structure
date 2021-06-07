import path from "path";
import IubStructure from "./lib/IubStructure";

var struct: IubStructure;

const load = async () => {
  const file = path.resolve(__dirname, "data", "inputs_data.json");

  struct = await IubStructure.CreateIubStructure(file);

  console.log(struct.getIubStructBySap("i01384"));

  return;
};

// [] to load inputs file
load();

// [] recursive function to filter inputs for a given product
//    [] by sap code
//    [] should be able to accept both character cases
// [] get prices from a prices list

// [] write results as csv file
