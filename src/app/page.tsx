import React from "react";
import data from "./data.json";
import { TreeView } from "@/components/TreeView";

const Home: React.FC = () => {
  return (
    <div className={"p-4"}>
      <h1 className={"pb-2"}>File Explorer</h1>
      <TreeView data={data.folders} />
    </div>
  );
};

export default Home;
