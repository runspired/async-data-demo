const firstNames: string[] = [
  'James',
  'Chris',
  'Thomas',
  'John',
  'William',
  'Michael',
  'Rosemary',
  'Sweet',
  'Wesley',
  'Erin',
  'Renée',
  'Marie',
];
const lastNames: string[] = ['Weeks', 'Youman', 'Thoburn', 'Thorbeorjn'];
let ID = 1;

let CACHE: any[] = [];

function randomInRange(max: number) {
  return Math.floor(Math.random() * max);
}

function makeUser(numFriends: number) {
  let id = `${ID++}`;
  let friends = [];
  for (let i = 0; i < numFriends; i++) {
    friends.push(makeUser(i));
  }
  let user: any = {
    type: 'user',
    id,
    lid: `user-${id}`,
    attributes: {
      firstName: firstNames[randomInRange(firstNames.length - 1)],
      lastName: lastNames[randomInRange(lastNames.length - 1)],
    },
    relationships: {
      friends: {
        data: friends,
      },
    },
  };

  CACHE.push(user);

  return { type: 'user', id, lid: user.lid };
}

makeUser(4);

/*
Makes 16 users

We have4 source

- main-thread:in-memory
- main-thread:index-db
- worker-thread:in-memory
- worker-thread:index-db

1
  2
  3
    4
  5
    6
    7
      8
  9
    10
    11
      12
    13
      14
      15
        16
*/

export default CACHE;
