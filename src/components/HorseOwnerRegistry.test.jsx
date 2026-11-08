import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HorseOwnerRegistry from './HorseOwnerRegistry.jsx';

beforeEach(() => localStorage.clear());

async function addOwner(user, name) {
  const form = screen.getByRole('form', { name: 'Owner form' });
  await user.type(within(form).getByLabelText('Owner name'), name);
  await user.click(within(form).getByRole('button', { name: 'Add owner' }));
}

async function addHorse(user, name, ownerName) {
  const form = screen.getByRole('form', { name: 'Horse form' });
  await user.type(within(form).getByLabelText('Horse name'), name);
  if (ownerName) await user.selectOptions(within(form).getByLabelText('Owner'), ownerName);
  await user.click(within(form).getByRole('button', { name: 'Add horse' }));
}

test('adds an owner and a horse linked to that owner', async () => {
  const user = userEvent.setup();
  render(<HorseOwnerRegistry />);

  await addOwner(user, 'Jane Doe');
  await addHorse(user, 'Thunder', 'Jane Doe');

  const horses = screen.getByRole('list', { name: 'Horses' });
  expect(within(horses).getByText('Thunder')).toBeInTheDocument();
  expect(within(horses).getByText('Owner: Jane Doe')).toBeInTheDocument();
  expect(screen.getByText(/\(1 horse\)/)).toBeInTheDocument();
});

test('deleting an owner leaves their horses unassigned', async () => {
  const user = userEvent.setup();
  render(<HorseOwnerRegistry />);

  await addOwner(user, 'Jane Doe');
  await addHorse(user, 'Thunder', 'Jane Doe');
  await user.click(screen.getByRole('button', { name: 'Delete Jane Doe' }));

  expect(screen.getByText('Owner: Unassigned')).toBeInTheDocument();
});

test('edits a horse', async () => {
  const user = userEvent.setup();
  render(<HorseOwnerRegistry />);

  await addHorse(user, 'Thunder');
  await user.click(screen.getByRole('button', { name: 'Edit Thunder' }));
  const nameInput = screen.getByLabelText('Horse name');
  await user.clear(nameInput);
  await user.type(nameInput, 'Lightning');
  await user.click(screen.getByRole('button', { name: 'Save horse' }));

  expect(screen.getByText('Lightning')).toBeInTheDocument();
  expect(screen.queryByText('Thunder')).not.toBeInTheDocument();
});

test('filters horses by owner', async () => {
  const user = userEvent.setup();
  render(<HorseOwnerRegistry />);

  await addOwner(user, 'Jane');
  await addOwner(user, 'Bob');
  await addHorse(user, 'Thunder', 'Jane');
  await addHorse(user, 'Spirit', 'Bob');

  await user.selectOptions(screen.getByLabelText('Show horses for'), 'Bob');
  const horses = screen.getByRole('list', { name: 'Horses' });
  expect(within(horses).getByText('Spirit')).toBeInTheDocument();
  expect(within(horses).queryByText('Thunder')).not.toBeInTheDocument();
});

test('keeps data after remounting (localStorage)', async () => {
  const user = userEvent.setup();
  const { unmount } = render(<HorseOwnerRegistry />);
  await addOwner(user, 'Jane Doe');
  unmount();

  render(<HorseOwnerRegistry />);
  const owners = screen.getByRole('list', { name: 'Owners' });
  expect(within(owners).getByText('Jane Doe')).toBeInTheDocument();
});
