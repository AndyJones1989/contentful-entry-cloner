import React, { useState } from "react";
import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Button, Select, Option } from "@contentful/f36-components";
import { createClient } from "contentful-management";

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const [env, setEnv] = useState<string>("test");

  const fieldsArray: string[] = [];

  for (let field in sdk.entry.fields) {
    fieldsArray.push(field);
  }

  const cloneEntry = async () => {
    const fields = sdk.entry.fields;

    const cma = createClient({
      apiAdapter: sdk.cmaAdapter,
    });

    const space = await cma.getSpace(sdk.ids.space);
    const environment = await space.getEnvironment(env);

    const transformedFields = {};

    for (let field in fields) {
      // @ts-ignore
      transformedFields[field] = {
        "en-GB": sdk.entry.fields[field].getValue("en-GB"),
      };
    }

    const newEntry = await environment.createEntryWithId(
      sdk.contentType.sys.id,
      sdk.entry.getSys().id,
      {
        fields: transformedFields,
      }
    );

    await newEntry.publish();
  };

  const handleEnvSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnv(e.target.value.toLowerCase());
    console.log(e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p>Select an Env to clone to</p>
      <Select name="environment" onChange={handleEnvSelect}>
        <Option value="test">Test</Option>
        <Option value="prod">Master</Option>
      </Select>
      <Button onClick={cloneEntry} variant="primary">
        Clone Me!
      </Button>
    </div>
  );
};

export default Sidebar;
