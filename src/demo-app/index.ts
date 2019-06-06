import DataService from './data-service';
import { createApp } from '../rendering';

function UserTreeComponent(user: any): DocumentFragment {
  let fragment = document.createDocumentFragment();
  let ul = document.createElement('ul');
  fragment.appendChild(document.createTextNode(`${user.firstName} ${user.lastName}`));
  fragment.appendChild(ul);
  let friends = user.friends || [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i].content;

    if (friend) {
      return ul.appendChild(UserTreeComponent(friend));
    }
  }

  return fragment;
}

async function main() {
  const dataService = new DataService();

  await createApp(async () => {
    const primaryUser = await dataService.request({
      params: { type: 'user', id: '1' },
    });
    return UserTreeComponent(primaryUser);
  }, document.body);
}

main();
