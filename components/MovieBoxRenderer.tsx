import { useEffect } from "react";
import {
  Shape,
  WebGLRenderer,
  Scene,
  TextureLoader,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  MeshPhongMaterial,
  Texture,
  PointLight,
  AmbientLight,
  PerspectiveCamera,
  ExtrudeGeometry,
} from "three";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const dvdWidth = 13.5; // in cm
const dvdHeight = 19.0; // in cm
const dvdDepth = 1.4; // in cm
const scaleFactor = 0.4;
const coverPadding = 0.2; // distance to edges of box
const coverMargin = 0.01; // to resolve Z fighting
const roundness = 0.125; // Roundness of box
const bumpiness = 0.125;
const shininess = 250; // Shiny

const boxWidth = dvdWidth * scaleFactor;
const boxHeight = dvdHeight * scaleFactor;
const boxDepth = dvdDepth * scaleFactor;

function createBoxWithRoundedEdges(
  width: number,
  height: number,
  depth: number,
  radius0: number,
  smoothness: number
): ExtrudeGeometry {
  let shape = new Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
  shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
  let geometry = new ExtrudeGeometry(shape, {
    depth: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness,
  });

  geometry.center();

  return geometry;
}

type Props = {
  frontCoverUrl: string;
  backCoverUrl: string;
  spineCoverUrl?: string | null;
};

function createFront(tex: Texture, bumpTex: Texture) {
  let front = new Mesh(
    new PlaneGeometry(boxWidth - coverPadding, boxHeight - coverPadding),
    new MeshPhongMaterial({
      map: tex,
      shininess,
      bumpMap: bumpTex,
      bumpScale: bumpiness,
    })
  );
  front.position.set(0, 0, boxDepth / 2 + coverMargin);
  return front;
}

function createBack(tex: Texture, bumpTex: Texture) {
  let back = new Mesh(
    new PlaneGeometry(boxWidth - coverPadding, boxHeight - coverPadding),
    new MeshPhongMaterial({
      map: tex,
      shininess,
      bumpMap: bumpTex,
      bumpScale: bumpiness,
    })
  );
  back.rotation.x = Math.PI;
  back.rotation.z = Math.PI;
  back.position.set(0, 0, -(boxDepth / 2 + coverMargin));
  return back;
}

function createBox(color: string) {
  const geometry = createBoxWithRoundedEdges(boxWidth, boxHeight, boxDepth, roundness, 16);

  const mesh = new Mesh(
    geometry,
    new MeshPhongMaterial({
      color,
      shininess,
    })
  );
  return mesh;
}

export default function MovieBoxRenderer({ frontCoverUrl, backCoverUrl, spineCoverUrl }: Props) {
  useEffect(() => {
    const el = document.getElementById("dvd-renderer")!;
    let WIDTH = el.clientWidth,
      HEIGHT = 500;

    const renderer = new WebGLRenderer({ antialias: true });
    const scene = new Scene();
    const loader = new TextureLoader();

    const frontTex = loader.load(frontCoverUrl, () => {});
    const backTex = loader.load(backCoverUrl, () => {});
    const bumpMapTex = loader.load("/assets/bump.jpg", () => {});

    frontTex.minFilter = LinearFilter;
    backTex.minFilter = LinearFilter;

    scene.add(createFront(frontTex, bumpMapTex));
    scene.add(createBack(backTex, bumpMapTex));
    scene.add(createBox("#fbfbfb"));

    renderer.setSize(WIDTH, HEIGHT);
    el.appendChild(renderer.domElement);

    const camera = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
    camera.position.set(-6, 3, 12);
    scene.add(camera);

    {
      const light = new PointLight(0x666666);
      light.position.set(-9, 0, 9);
      scene.add(light);
    }

    {
      const light = new PointLight(0x666666);
      light.position.set(9, 0, -9);
      scene.add(light);
    }

    {
      const light = new PointLight(0x444444);
      light.position.set(9, 0, 9);
      scene.add(light);
    }

    {
      const light = new PointLight(0x444444);
      light.position.set(-9, 0, -9);
      scene.add(light);
    }

    let ambience = new AmbientLight(0x777777); // soft white light
    scene.add(ambience);

    /*    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.maxDistance = 50;
    controls.autoRotateSpeed = 3; */
    // this.controls.addEventListener("change", () => this.animateIfNotRequested());

    return () => {
      renderer?.domElement.parentElement?.removeChild(renderer.domElement);

      renderer?.dispose();
      frontTex?.dispose();
      backTex?.dispose();
      bumpMapTex?.dispose();
      // controls?.dispose();
    };
  }, []);

  return (
    <>
      asd
      <div id="dvd-renderer" className="dvd-renderer"></div>
    </>
  );
}
