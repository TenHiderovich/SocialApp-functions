let db = {
  users: [
    {
      userId: 'wQQWWbBzM5SRCWAWWoUPtEsNM9h1',
      email: 'user@mail.com',
      handle: 'user',
      createdAt: '2019-07-25T09:24:17.964Z',
      imageUrl: 'image/asdfasdasdas/asdasda',
      bio: 'Hellow',
      website: 'www.site.ru',
      location: 'Russia'
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is a scream body',
      createdAt: '2019-07-25T09:24:17.964Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'xsdvsdfvdsfv',
      body: 'this is a comment body',
      createdAt: '2019-07-25T09:24:17.964Z',
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'join',
      createdAt: '2019-07-25T09:24:17.964Z',
      screamId: 'xsdvssvdsdvsddfvdsfv',
      type: 'like | comment',
      read: 'true | false',
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: 'wQQWWbBzM5SRCWAWWoUPtEsNM9h1',
    email: 'user@mail.com',
    handle: 'user',
    createdAt: '2019-07-25T09:24:17.964Z',
    imageUrl: 'image/asdfasdasdas/asdasda',
    bio: 'Hellow',
    website: 'www.site.ru',
    location: 'Russia'
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'xsdvsdfvdsfv'
    },
    {
      userHandle: 'user',
      screamId: 'xsdvssvdsdvsddfvdsfv'
    },
  ]
}