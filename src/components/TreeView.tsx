"use client";
import React, { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TreeNode } from "@/components/TreeNode";

export interface Folder {
  id: number;
  name: string;
  folders: Folder[];
  files: File[];
  permissions: string;
}

export interface File {
  id: number;
  name: string;
  permissions: string;
}

interface TreeViewProps {
  data: Folder[];
}

// Function to remove a node from the data
const removeNode = (
  data: Folder[],
  nodeId: number,
  fileId?: number
): Folder[] => {
  return data
    .map((node) => {
      if (node.id === nodeId) {
        if (typeof fileId === "number") {
          // Remove file
          const updatedFiles = node.files.filter((file) => file.id !== fileId);
          return {
            ...node,
            files: updatedFiles,
          };
        } else {
          // Remove folder
          return null;
        }
      }

      // Recursively remove from folders
      const updatedFolders = removeNode(node.folders, nodeId, fileId);

      // Only keep the node if it still has folders
      return {
        ...node,
        folders: updatedFolders.filter((folder) => folder !== null) as Folder[],
      };
    })
    .filter((node) => node !== null) as Folder[];
};

// Function to rename a node within the data
const renameNode = (
  data: Folder[],
  nodeId: number,
  newName: string,
  fileId: number | null
): Folder[] => {
  return data.map((node) => {
    if (node.id === nodeId) {
      if (fileId !== null) {
        // Rename file
        const updatedFiles = [...node.files];
        const searchedNode = updatedFiles.find((file) => file.id === fileId);

        if (searchedNode) {
          searchedNode.name = newName;
        }

        return {
          ...node,
          files: updatedFiles,
        };
      } else {
        // Rename folder
        return {
          ...node,
          name: newName,
        };
      }
    }

    // Recursively rename within folders
    const updatedFolders = renameNode(node.folders, nodeId, newName, fileId);

    return {
      ...node,
      folders: updatedFolders,
    };
  });
};

export const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileNotFound, setFileNotFound] = useState(false);
  const [searchData, setSearchData] = useState<Folder[]>([]);
  const [filteredData, setFilteredData] = useState<Folder[]>(data);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFileNotFound(false);

    if (query === "") {
      setSearchData([]);
    } else {
      const newFilteredData = filteredData
        .map((node) => filterTreeData(node, query))
        .filter((node) => node !== null) as Folder[];
      console.log(newFilteredData);
      setSearchData(newFilteredData);
    }
  };

  const handleDelete = (nodeId: number, fileId?: number) => {
    setFilteredData((prevFilteredData) => [
      ...removeNode(prevFilteredData, nodeId, fileId),
    ]);
  };

  const handleRename = (
    nodeId: number,
    newName: string,
    fileId: number | null
  ) => {
    const updatedData = renameNode(filteredData, nodeId, newName, fileId);
    setFilteredData(updatedData);
  };

  const filterTreeData = (node: Folder, query: string): Folder | null => {
    const matchesSearch = node.name.toLowerCase().includes(query.toLowerCase());

    const filteredFolders = node.folders
      .map((folder) => filterTreeData(folder, query))
      .filter((folder) => folder !== null) as Folder[];

    const filteredFiles = node.files.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );

    if (
      matchesSearch ||
      filteredFolders.length > 0 ||
      filteredFiles.length > 0
    ) {
      return {
        ...node,
        folders: filteredFolders,
        files: filteredFiles,
      };
    }

    return null;
  };

  const resultData =
    searchData.length > 0 || searchQuery ? searchData : filteredData;

  useEffect(() => {
    if (searchData.length > 0) {
      setSearchData(filteredData);
      handleSearch(searchQuery);
    }
  }, [filteredData]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <div className={"max-w-fit flex flex-col space-y-2"}>
        {resultData.length > 0 ? (
          resultData.map((folder) => (
            <TreeNode
              key={folder.id}
              node={folder}
              onDelete={handleDelete}
              onRenameFolder={(nodeId: number, newName: string) =>
                handleRename(nodeId, newName, null)
              }
              onRenameFile={(
                nodeId: number,
                fileId: number | null,
                newName: string
              ) => handleRename(nodeId, newName, fileId)}
            />
          ))
        ) : (
          <div style={{ color: "red", margin: "10px 0" }}>
            No items found :(
          </div>
        )}
      </div>
    </div>
  );
};
