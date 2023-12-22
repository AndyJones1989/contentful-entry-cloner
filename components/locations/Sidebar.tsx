import React, { useEffect, useState } from "react";
import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Button, Select, Option, Spinner } from "@contentful/f36-components";
import { FaceHappyIcon } from "@contentful/f36-icons";
import { createClient } from "contentful-management";

enum BuildStage {
  notStarted = 0,
  inProgress = 1,
  completed = 2,
}

const buttonContentByStage = {
  [BuildStage.notStarted]: "Clone Me!",
  [BuildStage.inProgress]: <Spinner variant="white" />,
  [BuildStage.completed]: <FaceHappyIcon variant="white" />,
};

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const [env, setEnv] = useState<string>("test");
  const [filteredEnvs, setFilteredEnvs] = useState<string[]>([]);
  const [buildStage, setBuildStage] = useState<BuildStage>(0);
  const [entryAlreadyExists, setEntryAlreadyExists] = useState<boolean>(false);

  useEffect(() => {
    const potentialEnvs = ["Test", "Master"];
    const filteredEnvs = potentialEnvs.filter(
      (env) => env.toLowerCase() !== sdk.ids.environment
    );
    setFilteredEnvs(filteredEnvs);
  }, [sdk.ids.environment]);

  const fieldsArray: string[] = [];

  for (let field in sdk.entry.fields) {
    fieldsArray.push(field);
  }

  const cloneEntry = async () => {
    setEntryAlreadyExists(false);
    setBuildStage(BuildStage.inProgress);
    const fields = sdk.entry.fields;

    const cma = createClient({
      apiAdapter: sdk.cmaAdapter,
    });

    const space = await cma.getSpace(sdk.ids.space);
    const environment = await space.getEnvironment(env);

    const displayFieldName = sdk.contentType.displayField;
    const displayFieldValue = fields[displayFieldName].getValue("en-GB");

    const existingEntries = await environment.getEntries({
      ["fields." + displayFieldName]: displayFieldValue,
      content_type: sdk.contentType.sys.id,
    });

    if (existingEntries.items.length > 0) {
      console.log("An entry with the same displayField already exists.");
      setEntryAlreadyExists(true);
      setBuildStage(BuildStage.notStarted);
      return;
    }

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
    setBuildStage(BuildStage.completed);
    await newEntry.publish();
    setTimeout(() => {
      setBuildStage(BuildStage.notStarted);
    }, 5000);
  };

  const handleEnvSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnv(e.target.value.toLowerCase());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p>Select an Env to clone to</p>
      {entryAlreadyExists && (
        <p style={{ color: "red" }}>
          That entry already exists in the target env.
        </p>
      )}
      <Select name="environment" onChange={handleEnvSelect}>
        {filteredEnvs &&
          filteredEnvs.map((env) => (
            <Option key={env} value={env}>
              {env}
            </Option>
          ))}
      </Select>
      <Button onClick={cloneEntry} variant="primary">
        {buttonContentByStage[buildStage]}
      </Button>
    </div>
  );
};

export default Sidebar;
