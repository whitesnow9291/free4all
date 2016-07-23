import React from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { Scrollbars } from 'react-custom-scrollbars';

import * as GiveawaysHelper from '../../../util/giveaways';
import * as UsersHelper from '../../../util/users';
import * as LayoutHelper from '../../../util/layout';

import { editComment, removeComment, flagComment } from '../../../api/giveaway-comments/methods';

const middot = <span>&nbsp;&middot;&nbsp;</span>;

const CommentsList = (self, comments, owner) => (
  <Scrollbars
    autoHide
    autoHeight
    autoHeightMin={1}
    autoHeightMax={500}>
    { comments.map(CommentRow(self, owner)) }
  </Scrollbars>
);

const CommentRow = (self, owner) => (comment, index) => (
  <div className="comment-row" key={index}>
    { self.state.currentlyEditing && self.state.currentlyEditing == comment._id ?
      CommentRowEditing(self, comment, owner) :
      CommentRowDisplay(self, comment, owner)
    }
  </div>
);

const CommentRowDisplay = (self, { _id, content, user, createdAt, updatedAt }, owner) => LayoutHelper.twoColumns(
  UsersHelper.getAvatar(user, 40, { margin: "0 auto", display: "flex" }),
  <div className="comment-body">
    <h5 className="comment-username">{ UsersHelper.getFullNameWithLabelIfEqual(user, owner, "Author") }</h5>
    { GiveawaysHelper.commentBody(content) }
    <p className="timestamp small-text">
      { updatedAt ? "updated " + moment(updatedAt).fromNow() : moment(createdAt).fromNow() }
      { self.props.showActions && Meteor.userId() ?
        user && user._id === Meteor.userId() ? CommentActionsOwner(self, _id, content) : CommentActionsNonOwner(self, _id, content) :
        null
      }
    </p>
  </div>,
  40
);

const CommentActionsOwner = (self, _id, content) => (
  <span>
    { middot }
    <a role="button" onTouchTap={ event => self.setState({ currentlyEditing: _id, editCommentValue: content }) }>Edit</a>
    { middot }
    <a role="button" onTouchTap={ event => self.handleRemoveComment(_id) }>Remove</a>
  </span>
);

const CommentActionsNonOwner = (self, _id, content) => (
  <span>
    { middot }
    <a role="button" onTouchTap={ event => self.handleFlagComment(_id) }>Flag</a>
  </span>
);

const CommentRowEditing = (self, { _id, content, user, createdAt, updatedAt }, owner) => LayoutHelper.twoColumns(
  UsersHelper.getAvatar(user, 40, { margin: "0 auto", display: "flex" }),
  <div className="comment-body">
    <h5 className="comment-username">{ UsersHelper.getFullNameWithLabelIfEqual(user, owner, "Author") }</h5>
    <TextField
      id="edit-comment-field"
      name="edit-comment"
      value={ self.state.editCommentValue }
      onChange={ event => self.setState({ editCommentValue: event.target.value }) }
      multiLine={true}
      fullWidth={true}
      hintText="Add a comment..."
      hintStyle={{ fontSize: 14 }}
      textareaStyle={{ fontSize: 14 }} />
    <p className="small-text">
      <a role="button" onTouchTap={ self.handleEditComment.bind(self) }>Save</a>
      { middot }
      <a role="button" onTouchTap={ event => self.setState({ currentlyEditing: null }) }>Cancel</a>
    </p>
  </div>,
  40
);

const NoComments = () => (
  <p>
    <em>No comments yet. { Meteor.user() ? "Add yours?" : "Login to comment!" }</em>
  </p>
);

export class GiveawayComments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentlyEditing: null,
      editCommentValue: "",
    };
  }

  handleEditComment(event) {
    const content = this.state.editCommentValue;
    const _id = this.state.currentlyEditing;
    const userId = Meteor.userId();

    if (!content.length || !userId)
      return false;

    this.setState({ editCommentValue: "", currentlyEditing: null });

    editComment.call({ _id, content, userId }, (error) => {
      if (error) {
        console.log(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment updated.', 'success');
      }
    });
  }

  handleRemoveComment(_id) {
    const userId = Meteor.userId();

    if (!_id)
      return false;

    removeComment.call({ _id, userId }, (error) => {
      if (error) {
        console.log(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment removed.', 'success');
      }
    });
  }

  handleFlagComment(_id) {
    const userId = Meteor.userId();

    if (!_id)
      return false;

    flagComment.call({ _id, userId }, (error) => {
      if (error) {
        console.log(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Thanks for flagging, we will be reviewing the comment shortly.', 'success');
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.currentlyEditing && !!this.state.currentlyEditing)
      $("#edit-comment-field").focus();
  }

  render() {
    return (
      <div className="giveaway comments-list">
        { this.props.comments.length ? CommentsList(this, this.props.comments, this.props.owner) : NoComments() }
      </div>
    );
  }
}