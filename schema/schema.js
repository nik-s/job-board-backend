const graphql = require('graphql')
const { Pagination } = require('@limit0/mongoose-graphql-pagination')

// Import MongoDB types
const User = require('../models/User')
const Company = require('../models/Company')
const Job = require('../models/Job')
const Cv = require('../models/Cv')

// Import GraphQL types
const UserType = require('./types/User')
const CompanyType = require('./types/Company')
const JobType = require('./types/Job')
const CvType = require('./types/Cv')
const SortType = require('./types/Sort')
const FilterType = require('./types/Filter')

// Import mutations
const registerUser = require('./mutations/registerUser')
const registerCompany = require('./mutations/registerCompany')
const loginUser = require('./mutations/loginUser')
const loginCompany = require('./mutations/loginCompany')
const composeJob = require('./mutations/composeJob')
const composeCv = require('./mutations/composeCv')
const updateUser = require('./mutations/updateUser')
const updateUserPassword = require('./mutations/updateUserPassword')
const updateCompany = require('./mutations/updateCompany')
const updateCompanyPassword = require('./mutations/updateCompanyPassword')
const updateCv = require('./mutations/updateCv')
const updateJob = require('./mutations/updateJob')
const deleteUser = require('./mutations/deleteUser')
const deleteCompany = require('./mutations/deleteCompany')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
} = graphql

/**
 * @param {Object} args
 * @param {Object} model
 */
const getFilteredOrPaginated = function(args, model) {
  let config = {
    pagination: {},
    sort: {},
    criteria: {},
  }
  if (args.first) config.pagination.first = args.first
  if (args.after) config.pagination.after = args.after

  if (args.sort) {
    let order

    // TODO create enums
    if (args.sort.order === 'ASC') {
      order = 1
    } else if (args.sort.order === 'DESC') {
      order = -1
    }

    config.sort.field = args.sort.field
    config.sort.order = order
  }

  if (args.filter) {
    config.criteria[args.filter.field] = {}
    if (args.filter.eq) {
      config.criteria[args.filter.field].$eq = args.filter.eq
    }

    if (args.filter.ne) {
      config.criteria[args.filter.field].$ne = args.filter.ne
    }
  }

  const paginated = new Pagination(model, config)
  return paginated.getEdges().then(res => {
    return res.map(({ node }) => {
      return node
    })
  })
}

const listArgs = {
  first: {
    type: GraphQLFloat,
  },
  after: {
    type: GraphQLString,
  },
  sort: {
    type: SortType,
  },
  filter: {
    type: FilterType,
  },
}

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(_parent, args) {
        return User.findById(args.id)
      },
    },
    company: {
      type: CompanyType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(_parent, args) {
        return Company.findById(args.id)
      },
    },
    job: {
      type: JobType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(_parent, args) {
        return Job.findById(args.id)
      },
    },
    cv: {
      type: CvType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(_parent, args) {
        return Cv.findById(args.id)
      },
    },
    users: {
      type: new GraphQLList(UserType),
      args: {
        ...listArgs,
      },
      resolve(_parent, args) {
        return getFilteredOrPaginated(args, User)
      },
    },
    companies: {
      type: new GraphQLList(CompanyType),
      args: {
        ...listArgs,
      },
      resolve(_parent, args) {
        return getFilteredOrPaginated(args, Company)
      },
    },
    jobs: {
      type: new GraphQLList(JobType),
      args: {
        ...listArgs,
      },
      resolve(_parent, args) {
        return getFilteredOrPaginated(args, Job)
      },
    },
    cvs: {
      type: new GraphQLList(CvType),
      args: {
        ...listArgs,
      },
      resolve(_parent, args) {
        return getFilteredOrPaginated(args, Cv)
      },
    },
  },
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    /**
     * Register mutations
     */
    registerUser,
    registerCompany,

    /**
     * Login mutations
     */
    loginUser,
    loginCompany,

    /**
     * Update mutations
     */
    updateUser,
    updateCompany,
    updateUserPassword,
    updateCompanyPassword,
    updateCv,
    updateJob,

    /**
     * Compose mutations
     */
    composeJob,
    composeCv,

    /**
     * Delete mutations
     */
    deleteUser,
    deleteCompany,
    // deleteCv,
    // deleteJob,
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
})
