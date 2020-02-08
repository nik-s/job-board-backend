const graphql = require('graphql')

const { GraphQLString, GraphQLNonNull, GraphQLInputObjectType } = graphql

const SortType = new GraphQLInputObjectType({
  name: 'Sort',
  fields: () => ({
    field: {
      type: new GraphQLNonNull(GraphQLString),
    },
    order: {
      type: GraphQLString,
    },
  }),
})

module.exports = SortType
