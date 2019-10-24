// eslint-disable-next-line import/no-extraneous-dependencies
import { storiesOf } from '@storybook/react';
import listDemo from './listDemo';

storiesOf('listView', module)
  .add('test1', () => listDemo())
