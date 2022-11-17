export default `
  extend type Query {
    numLabels: Int!
    getLabels: [Label!]!
    getLabelById(id: String!): Label
  }

  type Label {
    _id: String!
    name: String!
    aliases: [String!]!
    addedOn: Long!
    color: String

    # Resolvers
    thumbnail: Image
  }

  input LabelUpdateOpts {
    name: String
    aliases: [String!]
    thumbnail: String
    color: String
  }

  extend type Mutation {
    addLabel(name: String!, aliases: [String!]): Label!
    updateLabels(ids: [String!]!, opts: LabelUpdateOpts!): [Label!]!
    removeLabels(ids: [String!]!): Boolean!
  }
`;
