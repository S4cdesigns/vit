import React from "react";
import Select, { ActionMeta, MultiValue, SingleValue } from "react-select";

import {
  ACTOR_RATIO,
  ACTOR_SMALL,
  ACTOR_TALL,
  SCENE_RATIO,
  SQUARE,
  TALL,
  useSettings,
  WIDE,
} from "../../composables/use_settings";
import Subheading from "../Subheading";

type SceneOption = { value: SCENE_RATIO; label: string };

const SceneAspectRatios = () => {
  const { sceneAspectRatio, setSceneAspectRatio } = useSettings();

  const sceneOptions: readonly SceneOption[] = [
    { value: SQUARE, label: "Square" },
    { value: WIDE, label: "16:9" },
    { value: TALL, label: "4:3" },
  ];

  return (
    <div>
      <Subheading>Scene Aspect Ratio</Subheading>
      <Select
        value={{ value: sceneAspectRatio, label: sceneAspectRatio }}
        onChange={(newValue: SingleValue<SceneOption>, meta: ActionMeta<SceneOption>) => {
          if (newValue) {
            setSceneAspectRatio(newValue.value);
          }
        }}
        closeMenuOnSelect={true}
        isClearable={false}
        styles={{
          container: (provided) => ({
            ...provided,
            maxWidth: 400,
          }),
          option: (provided) => ({
            ...provided,
            color: "black",
          }),
          multiValue: (styles, { data }) => {
            return {
              ...styles,
              backgroundColor: "black",
              borderRadius: 4,
            };
          },
        }}
        options={sceneOptions}
        getOptionLabel={(label) => label.label}
        getOptionValue={(label) => label.value}
      />
    </div>
  );
};

type ActorOption = { value: ACTOR_RATIO; label: string };

const ActorAspectRatios = () => {
  const { actorAspectRatio, setActorAspectRatio } = useSettings();

  const actorOptions: readonly ActorOption[] = [
    { value: SQUARE, label: "Square" },
    { value: ACTOR_TALL, label: "9:16" },
    { value: ACTOR_SMALL, label: "3:4" },
  ];

  return (
    <div>
      <Subheading>Actor Aspect Ratio</Subheading>
      <Select
        value={{ value: actorAspectRatio, label: actorAspectRatio }}
        onChange={(newValue: SingleValue<ActorOption>, meta: ActionMeta<ActorOption>) => {
          if (newValue) {
            setActorAspectRatio(newValue.value);
          }
        }}
        closeMenuOnSelect={true}
        isClearable={false}
        styles={{
          container: (provided) => ({
            ...provided,
            maxWidth: 400,
          }),
          option: (provided) => ({
            ...provided,
            color: "black",
          }),
          multiValue: (styles, { data }) => {
            return {
              ...styles,
              backgroundColor: "black",
              borderRadius: 4,
            };
          },
        }}
        options={actorOptions}
        getOptionLabel={(label) => label.label}
        getOptionValue={(label) => label.value}
      />
    </div>
  );
};

type Props = {};

export default function ImageSettings(props: Props) {
  return (
    <>
      <SceneAspectRatios />
      <ActorAspectRatios />
    </>
  );
}
