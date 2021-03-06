import React from 'react';
import Formsy from 'formsy-react';
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';

import { Categories } from '../../../api/categories/categories';
import { insertCategory, updateCategory, removeCategory, reorderCategory } from '../../../api/categories/methods';

import * as Colors from 'material-ui/styles/colors';
import * as UsersHelper from '../../../util/users';
import * as IconsHelper from '../../../util/icons';
import * as LayoutHelper from '../../../util/layout';
import * as FormsHelper from '../../../util/forms';

const makeState = (prop, value) => {
  const s = {};
  s[prop] = value;
  return s;
};

const Handle = SortableHandle(() => (
  <IconButton tooltip="Drag to reorder" onTouchTap={ event => event.preventDefault() }>
    { IconsHelper.icon("menu", { color: Colors.grey700, fontSize: 18 }) }
  </IconButton>
));

const SortableItem = SortableElement(({ self, parentCat, cat }) => {
  if (!cat)
    return null;
  else if (cat._id == self.state[`currentlyEditing-${parentCat._id}`])
    return <EditRow self={self} cat={cat} parentCat={parentCat} />;
  else
    return <ItemRow self={self} cat={cat} parentCat={parentCat} />;
});

const ItemRow = ({ self, parentCat, cat }) => (
  <div className="sortable-row flex-row" data-id={ cat._id } data-parent-id={ parentCat._id }>
    <div className="col col-xs-2 col-sm-1 col-center">
      { self.state[`currentlyEditing-${parentCat._id}`] ? null : <Handle /> }
    </div>

    <div className="col col-xs-7 col-sm-9">
      <div className="flex-row nopad">
        <div className="col col-xs-12 col-sm-6">
          { cat.name }
        </div>
        <div className="col col-xs-12 col-sm-6">
          { IconsHelper.icon(cat.iconClass, { color: Colors.grey700, fontSize: 16, marginRight: 10 }) }
          { cat.iconClass }
        </div>
      </div>
    </div>
    <div className="col col-xs-3 col-sm-2 col-right">
      <IconButton className="row-action" onTouchTap={ self.handleSelectEdit.bind(self) } tooltip="Edit">
        { IconsHelper.icon("edit", { color: Colors.grey700, fontSize: 18 }) }
      </IconButton>
      <IconButton className="row-action" onTouchTap={ self.handleDelete.bind(self) } tooltip="Delete">
        { IconsHelper.icon("delete", { color: Colors.grey700, fontSize: 18 }) }
      </IconButton>
    </div>
  </div>
);

const EditRow = ({ self, parentCat, cat }) => (
  <Formsy.Form id={`edit-row-${parentCat}`} onValidSubmit={ self.handleSaveEdit(cat ? cat._id : null, parentCat ? parentCat._id : null) }>
    <div className="sortable-row flex-row" data-id={ cat ? cat._id : null } data-parent-id={ parentCat ? parentCat._id : null }>

      <div className="col col-xs-7 col-sm-9 col-xs-offset-2 col-sm-offset-1">
        <div className="flex-row nopad">
          <div className="col col-xs-12 col-sm-6">
            { FormsHelper.makeTextField({
              self, name: "cat-name", required: true, style: { fontSize: 14 },
              validationErrors: { isDefaultRequiredValue: "Please enter a category name." },
            }) }
          </div>

          <div className="col col-xs-12 col-sm-6">
            { FormsHelper.makeTextField({
              self, name: "cat-iconClass", required: true, style: { fontSize: 14 },
              validationErrors: { isDefaultRequiredValue: "Please enter the className for the icon." },
            }) }
          </div>
        </div>
      </div>

      <div className="col col-xs-3 col-sm-2 col-right">
        <IconButton type="submit" className="row-action" tooltip="Save" formNoValidate>
          { IconsHelper.icon("save", { color: Colors.grey700, fontSize: 18 }) }
        </IconButton>
        <IconButton className="row-action" onTouchTap={ self.handleCancelEdit.bind(self) } tooltip="Cancel edit">
          { IconsHelper.icon("cancel", { color: Colors.grey700, fontSize: 18 }) }
        </IconButton>
      </div>

    </div>
  </Formsy.Form>
);

const SortableList = SortableContainer(({ self, parentCat, items }) => (
  <div className="sortable-list-table">
    <div className="sortable-list-header flex-row hidden-xs">
      <div className="col col-xs-8 col-sm-9 col-xs-offset-1">
        <div className="flex-row nopad">
          <div className="col col-xs-12 col-sm-6">Category Name</div>
          <div className="col col-xs-12 col-sm-6">IconClass</div>
        </div>
      </div>
    </div>

    <div className="sortable-list-body">
      { items.map((catId, index) => {
        const cat = Categories.findOne(catId);
        return cat ? <SortableItem key={index} index={index} cat={ cat } parentCat={ parentCat } self={self} /> : null;
      }) }
      { self.state[`currentlyEditing-${parentCat._id}`] == "new" ?
        <EditRow self={self} parentCat={parentCat} cat={null} /> : null
      }
    </div>

    <div className="sortable-list-footer flex-row">
      <div className="col col-xs-12 col-right">
        <FlatButton label="Add New" onTouchTap={ self.handleAddNew(parentCat._id) } />
      </div>
    </div>
  </div>
));

export class ManageCategories extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitted: false,
    };

    this.props.orderedCategories.forEach(({ parentCat }) => {
      this.state[`currentlyEditing-${parentCat._id}`] = null;
    });
  }

  onSortEnd(parentCatIdx) {
    const self = this;
    return ({ oldIndex, newIndex }) => {
      if (oldIndex == newIndex)
        return;

      const oldIndexCatId = self.props.orderedCategories[parentCatIdx].children[oldIndex];
      const newIndexCatId = self.props.orderedCategories[parentCatIdx].children[newIndex];
      const newIndexCat = Categories.findOne(newIndexCatId);

      reorderCategory.call({ _id: oldIndexCatId, newIndex: newIndexCat.relativeOrder }, FormsHelper.bertAlerts("Categories reordered."));
    };
  }

  handleAddNew(parentCatId) {
    return () => {
      this.setState(makeState(`currentlyEditing-${parentCatId}`, "new"));
    };
  }

  handleSelectEdit(event) {
    event.preventDefault();
    const catId = $(event.target).closest(".sortable-row").data('id');
    const parentCatId = $(event.target).closest(".sortable-row").data('parent-id');
    this.selectEditRow(catId, parentCatId);
  }

  handleCancelEdit(event) {
    event.preventDefault();
    const parentCatId = $(event.target).closest(".sortable-row").data('parent-id');
    this.selectEditRow(null, parentCatId);
  }

  handleSaveEdit(catId, parentId) {
    return () => {
      const name = this.state['cat-name'];
      const iconClass = this.state['cat-iconClass'];

      if (!catId) {
        const maxOrderCat = Categories.findOne({ parent: parentId }, { sort: { relativeOrder: -1 } });
        const relativeOrder = maxOrderCat ? maxOrderCat.relativeOrder + 1 : 0;

        insertCategory.call({ name, iconClass, parent: parentId, relativeOrder }, FormsHelper.bertAlerts("Category added."));
      } else {
        updateCategory.call({ _id: catId, name, iconClass }, FormsHelper.bertAlerts("Category updated."));
      }

      this.selectEditRow(null, parentId);
    };
  }

  handleDelete(event) {
    event.preventDefault();
    const _id = $(event.target).closest(".sortable-row").data('id');
    removeCategory.call({ _id }, FormsHelper.bertAlerts("Category removed."));
  }

  selectEditRow(id, parentId) {
    const cat = Categories.findOne(id);
    if (!cat) {
      this.setState(makeState(`currentlyEditing-${parentId}`, null));
      this.setState({
        'cat-name': null,
        'cat-iconClass': null,
      });
    } else {
      this.setState(makeState(`currentlyEditing-${parentId}`, id));
      this.setState({
        'cat-name': cat.name,
        'cat-iconClass': cat.iconClass
      });
    }
  }

  render() {
    return (
      <div className="flex-row">

        <div className="col col-xs-12 nopad">

          <Card className="card">
            <CardTitle title="Manage Categories" subtitle="Material Icons are not supported for Category iconClass at the moment." />

            <CardText>
              <div className="flex-row nopad">
                <div className="col col-xs-12 nopad">
                  { this.props.orderedCategories.map(({ parentCat, children }, index) => (
                      <div className="sortable-list" key={index}>
                        <Subheader>{ parentCat.name }</Subheader>

                        <SortableList
                          self={this}
                          parentCat={ parentCat }
                          useDragHandle={true}
                          items={ children }
                          onSortEnd={ this.onSortEnd(index) }
                          lockToContainerEdges={true}
                          helperClass="sortable-active"
                          lockAxis="y"
                          lockOffset={0} />
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardText>
          </Card>

        </div>
      </div>
    );
  }
}
