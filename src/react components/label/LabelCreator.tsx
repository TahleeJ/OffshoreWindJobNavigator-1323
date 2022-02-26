import React, { useEffect, useState } from 'react';
import { editLabel, getSurveyReferencesToLabel, getLabels } from '../../firebase/Queries/LabelQueries';
import { Answer, hasId, Label, Survey, SurveyQuestion } from '../../firebase/Types';
import { setLabels } from '../../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks'; 
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import ListViewer from '../ListViewer';
import ListElement from '../survey/ListElement';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const LabelManager: React.FC<props> = (props) => {
    const [labelName, setInputValue] = useState("");
    const [surveyRefs, setSurveyRefs] = useState<Map<Survey & hasId, Map<SurveyQuestion, Answer[]>>>();
    const appDispatch = useAppDispatch();
    const currentOperation = useAppSelector(s => s.navigation.operationType);
    const reduxLabel = useAppSelector(s => s.navigation.operationData as Label & hasId);

    const changeLabel = async () => {
        await editLabel(reduxLabel.id, {
            ...reduxLabel,
            name: labelName
        });
        appDispatch(setLabels(await getLabels()));
        appDispatch(changePage({ type: PageType.LabelManage }))
    }

    useEffect(() => {
        //copy the data from the redux state into the local state if editing (and only do it when the redux state changes)
        if (currentOperation === OperationType.Editing) {
            setInputValue(reduxLabel.name);
        }

        getSurveyReferencesToLabel(reduxLabel.id).then(data => setSurveyRefs(data))
        
    }, [reduxLabel, currentOperation]);

    return (
        <div id='labelEditor' className='labelEditor'>
            <div className='labelHeader'>
                <div className='labelTitle'>Edit Label</div>
            </div>
            <div className="labelNamePrompt">
                <div className="title">Edit Label Name:</div>
                <input type="text" className="labelNameInput" value={labelName} onChange={(e) => setInputValue(e.target.value)} placeholder='Label Name'></input>
            </div>
            <div className="listContainer">
                <div className="questionsList">
                    <ListViewer height="350px" title="Associated Answers">
                        {surveyRefs !== undefined ?
                            [...surveyRefs].map(([survey, questionRefs]) => {
                                return (<ListViewer height='100' title={survey.title}>
                                {
                                    [...questionRefs].map(([question, answers]) => {
                                        return (<ListViewer height='100'  title={question.prompt}>
                                        {
                                            answers.map(answer => <ListElement name={answer.text ? answer.text : "scale"} handleEdit={() => alert("")} handleDelete={() => alert("")} />)
                                        }
                                        </ListViewer>)
                                    })
                                }
                                </ListViewer>)
                            })
                            : null
                        }
                    </ListViewer>
                </div>
                <div className="jobOpsList">
                    <ListViewer height="350px" title="Associated Job Opportunities">
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                    </ListViewer>
                </div>
            </div>
            <div className="buttons">
                <button className='gray' onClick={() => { appDispatch(changePage({ type: PageType.LabelManage })) }}>Cancel</button>
                <button className="green" onClick={changeLabel}>Save Changes</button>
            </div>
        </div>
    );
}

export default LabelManager;