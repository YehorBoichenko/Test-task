"use client";

import React, { useState, MouseEvent, memo, useRef, FormEvent } from "react";
import { File, Folder } from "@/components/TreeView";

interface TreeNodeProps {
  node: Folder;
  file?: File;
  onDelete: (nodeId: number, fileIndex?: number) => void;
  onRenameFolder: (nodeId: number, newName: string) => void;
  onRenameFile: (nodeId: number, fileIndex: number, newName: string) => void;
}

const iconStyle = "w-4 h-4 mr-1";

export const TreeNode: React.FC<TreeNodeProps> = memo(
  ({ node, onDelete, onRenameFolder, onRenameFile, file }) => {
    const item = file ? file : node;

    const [isOpen, setIsOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [oldName, setOldName] = useState(node.name);
    const [newName, setNewName] = useState(node.name);

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

    const hasChildren = node.folders.length > 0 || node.files.length > 0;

    const handleDeleteNode = () => {
      onDelete(node.id, file && file.id);
    };

    const handleStartRename = (
      e: MouseEvent<HTMLSpanElement>,
      fileId: number | null = null,
      name: string
    ) => {
      e.stopPropagation();
      setNewName(name);
      setOldName(name);
      setIsRenaming(true);
    };

    const handleFinishRename = () => {
      if (file) {
        onRenameFile(node.id, file.id, newName);
      } else {
        onRenameFolder(node.id, newName);
      }

      setIsRenaming(false);
    };

    const handleCancelRename = () => {
      setIsRenaming(false);
      setNewName(oldName);
    };

    return (
      <div style={{ minWidth: "350px" }}>
        <div
          onClick={hasChildren && !file ? handleToggle : undefined}
          className={`flex items-baseline space-x-2 cursor-pointer ${
            file && "text-gray-600"
          }`}
        >
          {!file ? (
            <>
              {hasChildren && (
                <span className={iconStyle}>{isOpen ? "[-]" : "[+]"}</span>
              )}
              <span className={iconStyle}>
                {hasChildren && isOpen ? "📂" : "📁"}
              </span>
              {!isRenaming && (
                <>
                  <span
                    className={`font-bold block mr-5 select-none`}
                    style={{ marginRight: "auto" }}
                  >
                    {item.name}
                  </span>
                  <span style={{ color: "gray" }}>{item.permissions}</span>
                </>
              )}
            </>
          ) : (
            <>
              <span className={iconStyle}>📄</span>
              {!isRenaming && (
                <>
                  <span>{item.name}</span>
                  <span style={{ marginLeft: "10px", color: "gray" }}>
                    {item.permissions}
                  </span>
                </>
              )}
            </>
          )}
          {isRenaming && (
            <input
              style={{ marginRight: "auto" }}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          )}
          {!isRenaming && (
            <>
              <div
                className={"w-6 h-6"}
                style={{ marginLeft: "10px", color: "red", cursor: "pointer" }}
                onClick={() => handleDeleteNode()}
              >
                🗑️
              </div>
              {item.permissions === "write" && (
                <div
                  className={"w-6 h-6"}
                  style={{
                    marginLeft: "10px",
                    color: "orange",
                    cursor: "pointer",
                  }}
                  onClick={(e) => handleStartRename(e, null, item.name)}
                >
                  ✏️
                </div>
              )}
            </>
          )}
          {isRenaming && (
            <div className={"flex items-baseline space-x-2"}>
              <div
                className={"w-6 h-6"}
                style={{ marginLeft: "10px", color: "gray", cursor: "pointer" }}
                onClick={handleFinishRename}
              >
                ✔️
              </div>
              <div
                className={"w-6 h-6"}
                style={{ marginLeft: "10px", color: "gray", cursor: "pointer" }}
                onClick={handleCancelRename}
              >
                ❌
              </div>
            </div>
          )}
        </div>
        {isOpen && (
          <div
            className={"flex flex-col space-y-2 mt-2"}
            style={{
              marginLeft: "20px",
              transition: "max-height 0.3s ease-in-out",
              maxHeight: "1000px",
            }}
          >
            {node.folders.map((folder) => (
              <TreeNode
                key={folder.id}
                node={folder}
                onDelete={onDelete}
                onRenameFolder={onRenameFolder}
                onRenameFile={onRenameFile}
              />
            ))}
            {!file &&
              node.files.map((file) => (
                <TreeNode
                  key={file.id}
                  node={node}
                  file={file}
                  onDelete={onDelete}
                  onRenameFolder={onRenameFolder}
                  onRenameFile={onRenameFile}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
);
