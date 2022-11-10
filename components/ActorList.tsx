import Link from "next/link";
import { Fragment } from "react";

type Props = {
  actors: { _id: string; name: string }[];
};

const style = {
  fontSize: 13,
  opacity: 0.66,
};

export default function ActorList({ actors }: Props) {
  if (actors.length > 4) {
    return <div style={style}>With {actors.length} actors</div>;
  }

  return (
    <div style={style}>
      With{" "}
      {actors.map((actor, index) => (
        <Fragment key={actor._id}>
          <Link key={actor._id} href={`/actor/${actor._id}`} passHref>
            <a className="hover">
              <b>{actor.name}</b>
            </a>
          </Link>
          <span key={`${actor._id}-comma`}>{index < actors.length - 1 && ", "}</span>
        </Fragment>
      ))}
    </div>
  );
}
