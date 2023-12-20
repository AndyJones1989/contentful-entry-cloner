import React, { useState } from "react";
import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Button, Select, Option } from "@contentful/f36-components";

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const [fields, setFields] = useState({});
  const [contentType, setContentType] = useState("");

  const cloneEntry = async () => {
    // Get the current entry's content type ID
    const contentTypeId = sdk.entry.getSys().contentType.sys.id;

    // Get the content model of the current entry
    const contentType = await sdk.space.getContentType(contentTypeId);

    // Get the current entry's fields
    const fields = sdk.entry.fields;

    setFields(fields);
    setContentType(contentType.name);
  };
  cloneEntry();
  const fieldsArray = [];

  for (let field in fields) {
    fieldsArray.push(field);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p>This is a {contentType} with the fields:</p>
      {fieldsArray.map((field) => (
        <p key={field}>
          <strong>{field}</strong>
        </p>
      ))}
      <p>Select an Env</p>
      <Select name="environment">
        <Option value="test">Test</Option>
        <Option value="prod">Prod</Option>
        <Option value="tempEnv">TempEnv</Option>
      </Select>
      <Button>Clone Me!</Button>
    </div>
  );
};

export default Sidebar;
