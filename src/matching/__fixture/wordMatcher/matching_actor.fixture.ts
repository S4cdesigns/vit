export const matchingActorFixtures = [
  {
    str: "jill kassidy swallowed",
    actor: {
      _id: "test",
      name: "Kassidy",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "jill kassidy swallowed",
    actor: {
      _id: "test",
      name: "Jill Kassidy",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill Kassidy - Jill’s Oral Expertise - Swallowed",
    actor: {
      _id: "test",
      name: "Jill Kassidy",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill Kassidy - Jill’s Oral Expertise - Swallowed",
    actor: {
      _id: "test",
      name: "abcdef abc",
      aliases: ["regex:kassidy"],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill’s Oral Expertise - Swallowed",
    actor: {
      _id: "test",
      name: "Jill",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill And Gina In A Sloppy Gargling Suck Party - Gina Valentina & Jill Kassidy - Swallowed",
    actor: {
      _id: "test",
      name: "Gina Valentina",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill And Gina In A Sloppy Gargling Suck Party - Gina Valentina & Jill KaSSidy - Swallowed",
    actor: {
      _id: "test",
      name: "Jill Kassidy",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill And Gina In A Sloppy Gargling Suck Party - gina Valentina&jill Kassidy - Swallowed",
    actor: {
      _id: "test",
      name: "Gina Valentina",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Kali Rose - Scene",
    actor: {
      _id: "test",
      name: "Kali Roses",
      aliases: ["Kali Rose"],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Kali Rose - Swallowed",
    actor: {
      _id: "test",
      name: "Kali Roses",
      aliases: ["regex:(Kali.*Swallowed)|(Swallowed.*Kali)"],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Swallowed - Kali Rose",
    actor: {
      _id: "test",
      name: "Kali Roses",
      aliases: ["regex:(Kali.*Swallowed)|(Swallowed.*Kali)"],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Swallowed - Kali Rose",
    actor: {
      _id: "test",
      name: "Kali Roses",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Swallowed - Kali Rose",
    actor: {
      _id: "test",
      name: "kali",
      aliases: [],
    },
    expected: false,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "Jill.And.Gina.In.A.Sloppy.Gargling.Suck.Party.Gina.Valentina.&.Jill.Kassidy.Swallowed.mp4",
    actor: {
      _id: "test",
      name: "Gina Valentina",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "[jill kassidy] swallowed",
    actor: {
      _id: "test",
      name: "Jill Kassidy",
      aliases: [],
    },
    expected: true,
    options: {
      ignoreSingleNames: true,
    },
  },
  {
    str: "[jill kassidy] swallowed",
    actor: {
      _id: "test",
      name: "Test",
      aliases: ["jill"],
    },
    expected: false,
    options: {
      ignoreSingleNames: true,
    },
  },
];
