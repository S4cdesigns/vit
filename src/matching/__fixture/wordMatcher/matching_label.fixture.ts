export const matchingLabelFixtures = [
  {
    str: "jill kassidy swallowed",
    label: {
      _id: "test",
      name: "Anal",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "Layla Love All Anal Blonde",
    label: {
      _id: "test",
      name: "Anal",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "Chanel Grey's First DP",
    label: {
      _id: "test",
      name: "Anal",
      aliases: ["dp"],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double penetration",
      aliases: ["regex:double.*"],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double penetration",
      aliases: ["double.*"],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "Double anal",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "dap",
      aliases: ["double anal"],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "7on1 Double Anal GangBang with Kira Thorn",
    label: {
      _id: "test",
      name: "dap",
      aliases: ["regex:double anal"],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with female performers",
    label: {
      _id: "test",
      name: "female",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with female performers",
    label: {
      _id: "test",
      name: "male",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with black haired performers",
    label: {
      _id: "test",
      name: "black",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with black haired performers",
    label: {
      _id: "test",
      name: "black haired",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with (black haired) performers",
    label: {
      _id: "test",
      name: "black",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "test title with (black haired) performers",
    label: {
      _id: "test",
      name: "black haired",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
  {
    str: "Hegre-Art.14.09.23.A.Day.In.The.Life.Of.Supermodel.Victoria.R",
    label: {
      _id: "test",
      name: "hegre",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
      wordSeparators: ["[-_\\.]"],
      groupSeparators: ["[\\s',()[\\]{}*]"],
    },
  },
  {
    str: "Hegre-Art.14.09.23.A.Day.In.The.Life.Of.Supermodel.Victoria.R",
    label: {
      _id: "test",
      name: "hegre art",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
      wordSeparators: ["[-_\\.]"],
      groupSeparators: ["[\\s',()[\\]{}*]"],
    },
  },
  {
    str: "Hegre-Art.14.09.23.A.Day.In.The.Life.Of.Supermodel.Victoria.R",
    label: {
      _id: "test",
      name: "hegre",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: false,
      wordSeparators: ["[-_]"],
      groupSeparators: ["[\\s',()[\\]{}*\\.]"],
    },
  },
  {
    str: "Hegre-Art.14.09.23.A.Day.In.The.Life.Of.Supermodel.Victoria.R",
    label: {
      _id: "test",
      name: "hegre art",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
      wordSeparators: ["[-_]"],
      groupSeparators: ["[\\s',()[\\]{}*\\.]"],
    },
  },
  {
    str: "téèst",
    label: {
      _id: "test",
      name: "teest",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: false,
    },
  },
];
