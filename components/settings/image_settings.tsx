import React from "react";
import Select, { ActionMeta, SingleValue } from "react-select";
import { useSelectStyle } from "../../composables/use_select_style";

import { ACTOR_RATIO, SCENE_RATIO, useSettings } from "../../composables/use_settings";
import Subheading from "../Subheading";

type SceneOption = { value: SCENE_RATIO; label: string };

const SceneAspectRatios = () => {
  const { sceneAspectRatio, setSceneAspectRatio } = useSettings();
  const selectStyle = useSelectStyle();

  return (
    <div>
      <Subheading>Scene Aspect Ratio</Subheading>
      <Select
        value={{ value: sceneAspectRatio, label: sceneAspectRatio }}
        onChange={(newValue: SingleValue<SceneOption>, _: ActionMeta<SceneOption>) => {
          if (newValue) {
            setSceneAspectRatio(newValue.value);
          }
        }}
        closeMenuOnSelect={true}
        isClearable={false}
        styles={{
          ...selectStyle,
        }}
        options={[
          { value: "1:1", label: "1:1" },
          { value: "16:9", label: "16:9" },
          { value: "4:3", label: "4:3" },
        ]}
        getOptionLabel={(label) => label.label}
        getOptionValue={(label) => label.value}
      />
    </div>
  );
};

type ActorOption = { value: ACTOR_RATIO; label: string };

const ActorAspectRatios = () => {
  const { actorAspectRatio, setActorAspectRatio } = useSettings();
  const selectStyle = useSelectStyle();

  return (
    <div>
      <Subheading>Actor Aspect Ratio</Subheading>
      <Select
        styles={{
          ...selectStyle,
        }}
        value={{
          label: actorAspectRatio,
          value: actorAspectRatio,
        }}
        onChange={(newValue: SingleValue<ActorOption>, _: ActionMeta<ActorOption>) => {
          if (newValue) {
            setActorAspectRatio(newValue.value);
          }
        }}
        closeMenuOnSelect={true}
        isClearable={false}
        options={[
          { value: "1:1", label: "1:1" },
          { value: "9:16", label: "9:16" },
          { value: "3:4", label: "3:4" },
        ]}
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
