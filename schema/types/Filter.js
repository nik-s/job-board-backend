const graphql = require('graphql')

const { GraphQLString, GraphQLNonNull, GraphQLInputObjectType } = graphql

const FilterType = new GraphQLInputObjectType({
  name: 'Filter',
  fields: () => ({
    /**
     * TODO
     * https://docs.mongodb.com/manual/reference/operator/query-comparison/
     */
    field: {
      type: new GraphQLNonNull(GraphQLString),
    },
    eq: {
      type: GraphQLString,
    },
    ne: {
      type: GraphQLString,
    },
  }),
})

module.exports = FilterType
