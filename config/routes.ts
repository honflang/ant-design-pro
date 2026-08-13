/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'register-result',
        icon: 'checkCircle',
        path: '/user/register-result',
        component: './user/register-result',
      },
      {
        name: 'register',
        icon: 'userAdd',
        path: '/user/register',
        component: './user/register',
      },
      {
        name: '404',
        component: './exception/404',
        path: '/user/*',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'home',
    component: './Welcome',
  },

  {
    path: '/pricing-billing',
    name: 'pricing-billing',
    icon: 'bank',
    routes: [
      {
        path: '/pricing-billing',
        redirect: '/pricing-billing/dashboard',
      },
      {
        path: '/pricing-billing/dashboard',
        name: 'dashboard',
        icon: 'dashboard',
        component: './pricing-billing/dashboard',
      },
      {
        path: '/pricing-billing/regional',
        name: 'regional',
        icon: 'global',
        routes: [
          {
            path: '/pricing-billing/regional',
            redirect: '/pricing-billing/regional/tax',
          },
          {
            name: 'tax',
            icon: 'audit',
            path: '/pricing-billing/regional/tax',
            component: './pricing-billing/regional/tax',
          },
        ],
      },
      {
        path: '/pricing-billing/pricing',
        name: 'pricing',
        icon: 'dollarCircle',
        routes: [
          {
            path: '/pricing-billing/pricing',
            redirect: '/pricing-billing/pricing/price-book',
          },
          {
            name: 'price-book',
            icon: 'book',
            path: '/pricing-billing/pricing/price-book',
            component: './pricing-billing/pricing/price-book',
          },
          {
            name: 'rules',
            icon: 'control',
            path: '/pricing-billing/pricing/rules',
            component: './pricing-billing/pricing/rules',
          },
          {
            name: 'simulation',
            icon: 'dotChart',
            path: '/pricing-billing/pricing/simulation',
            component: './pricing-billing/pricing/simulation',
          },
          {
            name: 'approval',
            icon: 'checkCircle',
            path: '/pricing-billing/pricing/approval',
            component: './pricing-billing/pricing/approval',
          },
        ],
      },
      {
        path: '/pricing-billing/billing',
        name: 'billing',
        icon: 'creditCard',
        routes: [
          {
            path: '/pricing-billing/billing',
            redirect: '/pricing-billing/billing/configuration',
          },
          {
            name: 'configuration',
            icon: 'setting',
            path: '/pricing-billing/billing/configuration',
            component: './pricing-billing/billing/configuration',
          },
          {
            name: 'run',
            icon: 'playCircle',
            path: '/pricing-billing/billing/run',
            component: './pricing-billing/billing/run',
          },
          {
            name: 'invoice',
            icon: 'fileText',
            path: '/pricing-billing/billing/invoice',
            component: './pricing-billing/billing/invoice',
          },
        ],
      },
      {
        path: '/pricing-billing/performance',
        name: 'performance',
        icon: 'lineChart',
        routes: [
          {
            path: '/pricing-billing/performance',
            redirect: '/pricing-billing/performance/revenue',
          },
          {
            name: 'revenue',
            icon: 'barChart',
            path: '/pricing-billing/performance/revenue',
            component: './pricing-billing/performance/revenue',
          },
          {
            name: 'deal',
            icon: 'fund',
            path: '/pricing-billing/performance/deal',
            component: './pricing-billing/performance/deal',
          },
        ],
      },
      {
        path: '/pricing-billing/customer',
        name: 'customer',
        icon: 'team',
        routes: [
          {
            path: '/pricing-billing/customer',
            redirect: '/pricing-billing/customer/360',
          },
          {
            name: '360',
            icon: 'user',
            path: '/pricing-billing/customer/360',
            component: './pricing-billing/customer/360',
          },
          {
            name: 'portfolio',
            icon: 'cluster',
            path: '/pricing-billing/customer/portfolio',
            component: './pricing-billing/customer/portfolio',
          },
        ],
      },
      {
        path: '/pricing-billing/reports',
        name: 'reports',
        icon: 'barChart',
        routes: [
          {
            path: '/pricing-billing/reports',
            redirect: '/pricing-billing/reports/analytics',
          },
          {
            name: 'analytics',
            icon: 'pieChart',
            path: '/pricing-billing/reports/analytics',
            component: './pricing-billing/reports/analytics',
          },
        ],
      },
      {
        path: '/pricing-billing/approvals/:approvalId',
        redirect: '/pricing-billing/pricing/approval',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/analysis',
  },
  {
    component: './exception/404',
    path: '/*',
  },
];
