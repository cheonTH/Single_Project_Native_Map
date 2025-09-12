import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity,
  Alert, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const BoardDetailScreen = () => {
  const [post, setPost] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [authorNickname, setAuthorNickname] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [myEmail, setMyEmail] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
 
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const fetchPost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/board/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setPost(data);
      setMainImage(data.imageUrls?.[0]);
      setRecipeSteps(data.recipeSteps || []);
      setAuthorNickname(data.nickName || '');
      setIsSaved(data.isSaved || false);
    } catch (err) {
      console.error('게시글 불러오기 실패:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort((a, b) => a.id - b.id);
      const flatList = [];
      sorted.forEach(parent => {
        if (!parent.parentId) {
          flatList.push(parent);
          sorted
            .filter(reply => reply.parentId === parent.id)
            .sort((a, b) => a.id - b.id)
            .forEach(reply => flatList.push(reply));
        }
      });

      setComments(flatList);
    } catch (err) {
      console.error('댓글 불러오기 실패:', err);
    }
  };

  const handleLike = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return Alert.alert("로그인 필요!", '로그인이 필요합니다.');
    try {
      const res = await axios.post(
        `http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/board/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(prev => ({
        ...prev,
        isLiked: res.data.liked,
        likeCount: res.data.likeCount,
      }));
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return Alert.alert("로그인 필요!", '로그인이 필요합니다.');
    try {
      const res = await axios.post(
        `http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/board/${post.id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.saved);
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handleDelete = async () => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        onPress: async () => {
          const token = await AsyncStorage.getItem('token');
          await axios.delete(`http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/board/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEdit = () => {
    setActionSheetVisible(false);
    navigation.navigate('게시글 수정', { boardId: post.id });
  };

  const handleSubmitComment = async () => {
    const email = await AsyncStorage.getItem('email');
    const token = await AsyncStorage.getItem('token');
    if (!newComment.trim()) return;
    if (!token) return Alert.alert("로그인 필요!", '로그인이 필요합니다.');

    try {
      if (editingCommentId) {
        await axios.put(
          `http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/comments/${editingCommentId}`,
          { content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/comments',
          {
            boardId: id,
            email,
            content: newComment,
            parentId: replyTo || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setNewComment('');
      setReplyTo(null);
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      console.error('댓글 등록 실패:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return Alert.alert("로그인 필요!", '로그인이 필요합니다.');
    try {
      await axios.delete(`http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };

  const handleEditComment = (comment) => {
    setNewComment(comment.content);
    setEditingCommentId(comment.id);
    setReplyTo(null);
  };

  const toggleCommentModal = () => {
    setCommentModalVisible(!commentModalVisible);
    if (!showComments) fetchComments();
  };

  const handleGoBack = () => navigation.goBack();

  useEffect(() => {
    const init = async () => {
      const email = await AsyncStorage.getItem('email');
      setMyEmail(email);
    };
    init();
    fetchPost();
    fetchComments();
  }, []);

  useLayoutEffect(() => {
    if (post && myEmail) {
      navigation.setOptions({
        headerRight: () =>
          post.email !== myEmail && (
            <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 20 }}>{isSaved ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ),
      });
    }
  }, [navigation, isSaved, post, myEmail]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {mainImage && <Image source={{ uri: mainImage }} style={styles.mainImage} />}
        <Text style={styles.title}>{post?.title}</Text>
        <Text style={styles.meta}>작성자: {authorNickname}</Text>
        <Text style={styles.meta}>{post?.writingTime}</Text>
          <>
            <View style={styles.divider} />
            <Text style={styles.paragraph}>{post?.content}</Text>
          </>
        
      </ScrollView>

      {/* 하단 바 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>목록</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCommentModal} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>💬 댓글({comments.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLike} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>{post?.isLiked ? '💗' : '🤍'} {post?.likeCount}</Text>
        </TouchableOpacity>
        {post?.email === myEmail && (
          <TouchableOpacity onPress={() => setActionSheetVisible(true)} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 댓글 모달 */}
      <Modal visible={commentModalVisible} animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity onPress={toggleCommentModal}>
              <Text style={{ textAlign: 'right', fontSize: 16, marginBottom: 10 }}>✕ 닫기</Text>
            </TouchableOpacity>
            <ScrollView>
              {comments.map((cmt, index) => (
                <View
                  key={index}
                  style={[
                    styles.commentItem,
                    cmt.parentId && {
                      marginLeft: 16,
                      backgroundColor: '#f5f5f5',
                      padding: 6,
                      borderRadius: 4,
                    },
                  ]}
                >
                  <Text style={styles.commentAuthor}>{cmt.nickName}</Text>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentContent}>{cmt.content}</Text>
                    <Text style={styles.commentTime}>{cmt.time}</Text>
                  </View>
                  <View style={styles.commentActions}>
                    <TouchableOpacity onPress={() => {
                      setReplyTo(cmt.parentId || cmt.id);
                      setNewComment('');
                    }}>
                      <Text style={styles.actionText}>답글</Text>
                    </TouchableOpacity>
                    {cmt.email === myEmail && (
                      <>
                        <Text style={styles.actionText}> | </Text>
                        <TouchableOpacity onPress={() => handleEditComment(cmt)}>
                          <Text style={styles.actionText}>수정</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionText}> | </Text>
                        <TouchableOpacity onPress={() => handleDeleteComment(cmt.id)}>
                          <Text style={styles.actionText}>삭제</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
                style={styles.input}
              />
              <TouchableOpacity onPress={handleSubmitComment} style={styles.submitBtn}>
                <Text style={{ color: 'white' }}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 수정/삭제 모달 */}
      <Modal visible={actionSheetVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setActionSheetVisible(false)}>
          <View style={styles.actionSheet}>
            <Pressable onPress={handleEdit}>
              <Text style={styles.actionText}>✏️ 수정</Text>
            </Pressable>
            <Pressable onPress={handleDelete}>
              <Text style={[styles.actionText, { color: 'red' }]}>🗑 삭제</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  mainImage: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  meta: { fontSize: 13, color: '#555', marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  badge: { fontSize: 14, color: '#333', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  paragraph: { fontSize: 14, marginBottom: 12, color: '#444' },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepImage: { width: 100, height: 100, borderRadius: 6, marginRight: 12 },
  stepText: { flex: 1, fontSize: 14, color: '#333', marginTop: 4 },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bottomBtn: { alignItems: 'center' },
  bottomBtnText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  actionText: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
  commentItem: { marginBottom: 12 },
  commentAuthor: { fontWeight: 'bold', fontSize: 14 },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  commentContent: { fontSize: 14, color: '#333' },
  commentTime: { fontSize: 12, color: '#888', marginLeft: 6 },
  commentActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 10,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
});

export default BoardDetailScreen;
