import path from "path";
import IubStructure from "./lib/IubStructure";

const load = async () => {
  const file = path.resolve(__dirname, "data", "inputs_data.json");

  const inputs = await IubStructure.CreateIubStructure(file);

  return;
};

// [] to load inputs file
load();

// [] recursive function to filter inputs for a given produtc

// [] write results as csv file
