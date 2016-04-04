import Ember from 'ember';
import { buildSelector } from './helpers';
import { create } from './create';
import { count } from '../page-object';

function merge(target, ...objects) {
  objects.forEach(o => Ember.assign(target, o));

  return target;
}

function generateEnumerable(definition) {
  var enumerable = merge({}, definition);

  delete enumerable.itemScope;

  if (typeof enumerable.count === 'undefined') {
    enumerable.count = count(definition.itemScope)
  }

  return create(enumerable, { parent: this });
}

function generateItem(index, definition) {
  var filters = merge({}, { scope: definition.scope, at: index });
  var scope = buildSelector({}, definition.itemScope, filters);

  return create(merge({}, definition.item, { scope, resetScope: definition.resetScope }), { parent: this });
}

/**
 * Creates a component that represents a collection of items. The collection is zero-indexed.
 *
 * Collections have a `count` property that returns the number of elements in the collection.
 *
 * The collection returned by the collection method behaves as a regular PageObject when called without an index.
 *
 * When called with an index, the method returns the matching item.
 *
 * @example
 *
 * // <table>
 * //   <caption>List of users</caption>
 * //   <tbody>
 * //     <tr>
 * //       <td>Mary<td>
 * //       <td>Watson</td>
 * //     </tr>
 * //     <tr>
 * //       <td>John<td>
 * //       <td>Doe</td>
 * //     </tr>
 * //   </tbody>
 * // </table>
 *
 * const page = PageObject.create({
 *   users: collection({
 *     itemScope: 'table tr',
 *
 *     item: {
 *       firstName: text('td', { at: 0 }),
 *       lastName: text('td', { at: 1 })
 *     },
 *
 *     caption: text('caption')
 *   })
 * });
 *
 * assert.equal(page.users().count, 2);
 * assert.equal(page.users().caption, 'List of users');
 * assert.equal(page.users(1).firstName, 'John');
 * assert.equal(page.users(1).lastName, 'Doe');
 *
 * @example
 *
 * // <div class="admins">
 * //   <table>
 * //     <tbody>
 * //       <tr>
 * //         <td>Mary<td>
 * //         <td>Watson</td>
 * //       </tr>
 * //       <tr>
 * //         <td>John<td>
 * //         <td>Doe</td>
 * //       </tr>
 * //     </tbody>
 * //   </table>
 * // </div>
 *
 * // <div class="normal">
 * //   <table>
 * //   </table>
 * // </div>
 *
 * const page = PageObject.create({
 *   users: collection({
 *     scope: '.admins',
 *
 *     itemScope: 'table tr',
 *
 *     item: {
 *       firstName: text('td', { at: 0 }),
 *       lastName: text('td', { at: 1 })
 *     }
 *   })
 * });
 *
 * assert.equal(page.users().count, 2);
 *
 * @example
 *
 * // <table>
 * //   <caption>User Index</caption>
 * //   <tbody>
 * //     <tr>
 * //       <td>Doe</td>
 * //     </tr>
 * //   </tbody>
 * // </table>
 *
 * const page = PageObject.create({
 *   users: PageObject.collection({
 *     scope: 'table',
 *     itemScope: 'tr',
 *
 *     item: {
 *       firstName: text('td', { at: 0 })
 *     },
 *
 *     caption: PageObject.text('caption')
 *   })
 * });
 *
 * assert.equal(page.users().caption, 'User Index');
 *
 * @param {Object} definition - Collection definition
 * @param {string} definition.scope - Nests provided scope within parent's scope
 * @param {boolean} definition.resetScope - Override parent's scope
 * @param {String} definition.itemScope - CSS selector
 * @param {Object} definition.item - Item definition
 * @return {Descriptor}
 */
export function collection(definition) {
  return {
    isDescriptor: true,

    value(index) {
      if (typeof index === 'number') {
        return generateItem.call(this, index, definition);
      } else {
        return generateEnumerable.call(this, definition);
      }
    }
  };
}
